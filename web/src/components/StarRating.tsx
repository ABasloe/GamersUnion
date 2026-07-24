interface Props {
  value: number | null; // 1-10
  onChange?: (value: number | null) => void;
  compact?: boolean;
}

/** 10-point rating rendered as 5 stars (half-star granularity), like MAL/Goodreads hybrids. */
export function StarRating({ value, onChange, compact }: Props) {
  const stars = [];
  for (let star = 1; star <= 5; star++) {
    const starValue = star * 2;
    const filled = value != null && value >= starValue;
    const half = value != null && value === starValue - 1;
    stars.push(
      <span key={star} className={`star ${onChange ? 'star-interactive' : ''}`}>
        {onChange && (
          <>
            <button
              className="star-half-hit left"
              aria-label={`Rate ${starValue - 1} out of 10`}
              onClick={() => onChange(value === starValue - 1 ? null : starValue - 1)}
            />
            <button
              className="star-half-hit right"
              aria-label={`Rate ${starValue} out of 10`}
              onClick={() => onChange(value === starValue ? null : starValue)}
            />
          </>
        )}
        <span className={`star-glyph ${filled ? 'full' : half ? 'half' : 'empty'}`}>
          {filled ? '★' : half ? '⯨' : '☆'}
        </span>
      </span>,
    );
  }
  return (
    <span className={`star-rating ${compact ? 'compact' : ''}`}>
      {stars}
      {value != null && <span className="star-value">{value}/10</span>}
    </span>
  );
}
