using System.Net;
using System.Net.Mail;
using System.Text;
using System.Net.Http.Json;
using ErasmusWithUs.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ErasmusWithUs.Api.Services;

public sealed class DeadlineReminderWorker(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<DeadlineReminderWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));
        do
        {
            await SendDueRemindersAsync(stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task SendDueRemindersAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var database = scope.ServiceProvider.GetRequiredService<ErasmusDbContext>();
            var reminders = await database.DeadlineReminders
                .Where(item => item.SentAt == null)
                .ToListAsync(cancellationToken);
            if (reminders.Count == 0) return;

            var userIds = reminders.Select(item => item.UserId).Distinct().ToArray();
            var opportunityIds = reminders.Select(item => item.OpportunityId).Distinct().ToArray();
            var users = await database.Users.Where(item => userIds.Contains(item.Id) && item.EmailVerified)
                .ToDictionaryAsync(item => item.Id, cancellationToken);
            var opportunities = await database.Opportunities.Where(item => opportunityIds.Contains(item.Id))
                .ToDictionaryAsync(item => item.Id, cancellationToken);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            foreach (var reminder in reminders)
            {
                cancellationToken.ThrowIfCancellationRequested();
                if (!users.TryGetValue(reminder.UserId, out var user) ||
                    !opportunities.TryGetValue(reminder.OpportunityId, out var opportunity) ||
                    !DateOnly.TryParse(opportunity.Deadline, out var deadline))
                    continue;

                var daysUntilDeadline = deadline.DayNumber - today.DayNumber;
                if (daysUntilDeadline < 0 || daysUntilDeadline > reminder.DaysBefore) continue;

                var body = $"Hello {user.DisplayName},\n\n" +
                    $"The listed application deadline for {opportunity.University} is {deadline:dd MMM yyyy} " +
                    $"({daysUntilDeadline} days from today).\n\n" +
                    "Deadlines can change. Confirm the current date and your bilateral exchange agreement with your home university coordinator.\n\n" +
                    "Open Erasmus With Us to review the destination and your application plan.\n\n" +
                    "Erasmus With Us";

                var emailSent = await SendEmailAsync(user.Email, opportunity.University, body, cancellationToken);
                var pushSent = await SendPushNotificationsAsync(database, user.Id,
                    $"Deadline reminder · {opportunity.University}",
                    $"The listed application deadline is {deadline:dd MMM yyyy} ({daysUntilDeadline} days from today).",
                    cancellationToken);
                if (!emailSent && !pushSent) continue;
                reminder.SentAt = DateTimeOffset.UtcNow;
                await database.SaveChangesAsync(cancellationToken);
            }

        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // The host is shutting down.
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Deadline reminder delivery failed.");
        }
    }

    private static async Task<bool> SendPushNotificationsAsync(
        ErasmusDbContext database,
        int userId,
        string title,
        string body,
        CancellationToken cancellationToken)
    {
        var devices = await database.PushDevices
            .Where(item => item.UserId == userId)
            .ToListAsync(cancellationToken);
        if (devices.Count == 0) return false;

        using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        var sent = false;
        foreach (var device in devices)
        {
            using var response = await client.PostAsJsonAsync(
                "https://exp.host/--/api/v2/push/send",
                new
                {
                    to = device.ExpoPushToken,
                    title,
                    body,
                    data = new { type = "deadline" }
                },
                cancellationToken);
            if (response.IsSuccessStatusCode)
                sent = true;
            else if ((int)response.StatusCode is >= 400 and <= 499)
                database.PushDevices.Remove(device);
        }
        return sent;
    }

    private async Task<bool> SendEmailAsync(string email, string university, string body, CancellationToken cancellationToken)
    {
        var host = configuration["Email:SmtpHost"];
        var from = configuration["Email:From"] ?? configuration["Email:Username"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            if (configuration.GetValue<bool>("Development:AllowEmailLogging"))
            {
                logger.LogInformation("Development deadline reminder for {Email}: {Body}", email, body);
                return true;
            }

            logger.LogWarning("SMTP is not configured. Deadline reminder for {Email} was left pending.", email);
            return false;
        }

        try
        {
            var senderAddress = new MailAddress(from).Address;
            var senderName = configuration["Email:FromName"]?.Trim() is { Length: > 0 } configuredName
                ? configuredName
                : "Erasmus With Us";
            using var client = new SmtpClient(host, configuration.GetValue<int?>("Email:SmtpPort") ?? 587)
            {
                EnableSsl = configuration.GetValue("Email:EnableSsl", true),
                Credentials = new NetworkCredential(configuration["Email:Username"], configuration["Email:Password"])
            };
            using var message = new MailMessage(
                new MailAddress(senderAddress, senderName, Encoding.UTF8),
                new MailAddress(email))
            {
                Subject = $"Erasmus With Us · deadline reminder for {university}",
                Body = body
            };
            await client.SendMailAsync(message, cancellationToken);
            return true;
        }
        catch (Exception exception) when (exception is SmtpException or ArgumentException or FormatException or InvalidOperationException)
        {
            logger.LogError(exception, "Could not send deadline reminder to {Email}.", email);
            return false;
        }
    }
}
