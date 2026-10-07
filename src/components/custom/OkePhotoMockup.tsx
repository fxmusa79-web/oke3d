import './OkePhotoMockup.css'

const SILHOUETTE = '/assets/dark/black-fitness-kettlebell.png'

type Props = {
  photoUrl: string
}

/** OKE silhouette with uploaded photo as texture (CSS mask mockup). */
export function OkePhotoMockup({ photoUrl }: Props) {
  return (
    <div className="cdm-mockup" aria-hidden="true">
      <div className="cdm-mockup__stage">
        <div
          className="cdm-mockup__figure"
          style={{
            backgroundImage: `url(${photoUrl})`,
            WebkitMaskImage: `url(${SILHOUETTE})`,
            maskImage: `url(${SILHOUETTE})`,
          }}
        />
        <img className="cdm-mockup__outline" src={SILHOUETTE} alt="" draggable={false} />
      </div>
      <p className="cdm-mockup__caption">Concept mockup — jouw foto × OKE silhouette</p>
    </div>
  )
}
