import { ExternalLink } from 'lucide-react'
import './FeaturedCampuses.css'

const campuses = [
  {
    name: 'KU Leuven',
    location: 'Leuven, Belgium',
    rank: 59,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/KU_Leuven_%288898212081%29.jpg/1280px-KU_Leuven_%288898212081%29.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:KU_Leuven_(8898212081).jpg',
    photographer: 'Bernt Rostad',
    license: 'CC BY 2.0',
    qsSource: 'https://www.topuniversities.com/universities/ku-leuven',
  },
  {
    name: 'University of Helsinki',
    location: 'Helsinki, Finland',
    rank: 123,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/University_of_Helsinki%2C_Main_Building_%2852890870759%29.jpg/1280px-University_of_Helsinki%2C_Main_Building_%2852890870759%29.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:University_of_Helsinki,_Main_Building_(52890870759).jpg',
    photographer: 'Marty B',
    license: 'CC BY-SA 2.0',
    qsSource: 'https://www.topuniversities.com/universities/university-helsinki',
  },
  {
    name: 'University of Barcelona',
    location: 'Barcelona, Spain',
    rank: 165,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/University_of_Barcelona_-_main_buildings_07.jpg/1280px-University_of_Barcelona_-_main_buildings_07.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:University_of_Barcelona_-_main_buildings_07.jpg',
    photographer: 'Joe Mabel',
    license: 'CC BY-SA 4.0',
    qsSource: 'https://www.topuniversities.com/universities/universitat-de-barcelona',
  },
]

export default function FeaturedCampuses() {
  return <section className="featured-campus-section" aria-labelledby="featured-campus-title">
    <div className="featured-campus-heading">
      <div>
        <span className="section-kicker">FEATURED QS CAMPUSES</span>
        <h3 id="featured-campus-title">University photos and QS rankings</h3>
      </div>
      <span className="featured-campus-edition">QS World University Rankings 2027</span>
    </div>
    <div className="featured-campus-grid">
      {campuses.map((campus) => <article className="featured-campus-card" key={campus.name}>
        <a className="featured-campus-photo" href={campus.photoSource} target="_blank" rel="noreferrer" aria-label={`Open photo source for ${campus.name}`}>
          <img src={campus.photo} alt={`${campus.name} campus`} loading="lazy" />
        </a>
        <div className="featured-campus-info">
          <div className="featured-campus-name">
            <strong>{campus.name}</strong>
            <span>{campus.location}</span>
          </div>
          <a className="featured-campus-rank" href={campus.qsSource} target="_blank" rel="noreferrer" aria-label={`${campus.name}, QS World University Rankings 2027 rank ${campus.rank}`}>
            <small>QS WUR 2027</small><strong>#{campus.rank}</strong><ExternalLink size={12} />
          </a>
          <small className="featured-campus-credit">
            Photo by {campus.photographer} · <a href={campus.photoSource} target="_blank" rel="noreferrer">{campus.license}</a>
          </small>
        </div>
      </article>)}
    </div>
    <p className="featured-campus-disclaimer">Rankings are one comparison point and do not determine Erasmus eligibility. Confirm exchange options with your home university.</p>
  </section>
}
