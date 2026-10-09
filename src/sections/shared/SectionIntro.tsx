/** Section heading (h2) + optional intro — shared by fk-* sections. */
export function SectionIntro({
  id,
  title,
  intro,
}: {
  id: string
  title: string
  intro?: string
}) {
  return (
    <div className="max-w-3xl">
      <h2
        id={`${id}-title`}
        data-ui-id={`${id}-title`}
        data-ui-role="section-title"
        className="text-4xl md:text-5xl"
      >
        {title}
      </h2>
      {intro && (
        <p
          data-ui-role="section-description"
          className="mt-5 text-lg text-muted-foreground"
        >
          {intro}
        </p>
      )}
    </div>
  )
}
