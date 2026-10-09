FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ErasmusWithUs.Api/ErasmusWithUs.Api.csproj ErasmusWithUs.Api/
RUN dotnet restore ErasmusWithUs.Api/ErasmusWithUs.Api.csproj

COPY ErasmusWithUs.Api/ ErasmusWithUs.Api/
RUN dotnet publish ErasmusWithUs.Api/ErasmusWithUs.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000
ENTRYPOINT ["sh", "-c", "dotnet ErasmusWithUs.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
