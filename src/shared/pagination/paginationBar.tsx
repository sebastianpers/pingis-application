import { useMemo } from "react";
import Pagination from "react-bootstrap/Pagination";

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  windowSize?: number;
  size?: "sm" | "lg";
  containerClassName?: string;
  paginationClassName?: string;
  summaryClassName?: string;
  showSummary?: boolean;
  renderSummary?: (
    page: number,
    totalPages: number,
    total: number
  ) => React.ReactNode;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
};

export default function PaginationBar({
  page,
  total,
  pageSize,
  onPageChange,
  windowSize = 2,
  size = "md",
  containerClassName = "d-flex flex-column justify-content-between align-items-center mt-4",
  paginationClassName = "my-3",
  summaryClassName = "text-muted",
  showSummary = true,
  renderSummary,
  showFirstLast = true,
  showPrevNext = true,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Bygg en kompakt listning av sidnummer med ellipser
  const items = useMemo<(number | "…")[]>(() => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const around = pages.filter(
      (p) => Math.abs(p - page) <= windowSize || p === 1 || p === totalPages
    );

    const out: (number | "…")[] = [];

    for (let i = 0; i < around.length; i++) {
      if (i && around[i] - around[i - 1] > 1) out.push("…");
      out.push(around[i]);
    }

    return out;
  }, [page, totalPages, windowSize]);

  // Klampa mål-sidan inom [1, totalPages]
  const goTo = (p: number) =>
    onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div className={containerClassName}>
      {showSummary && (
        <small className={summaryClassName}>
          {renderSummary ? (
            renderSummary(page, totalPages, total)
          ) : (
            <>
              Sida {page} av {totalPages} — totalt {total} rader
            </>
          )}
        </small>
      )}

      <Pagination size={size} className={paginationClassName}>
        {showFirstLast && (
          <Pagination.First onClick={() => goTo(1)} disabled={page === 1} />
        )}

        {showPrevNext && (
          <Pagination.Prev
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          />
        )}

        {items.map((it, idx) =>
          it === "…" ? (
            <Pagination.Ellipsis key={`e-${idx}`} disabled />
          ) : (
            <Pagination.Item
              key={it}
              active={it === page}
              onClick={() => goTo(it)}
            >
              {it}
            </Pagination.Item>
          )
        )}

        {showPrevNext && (
          <Pagination.Next
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          />
        )}

        {showFirstLast && (
          <Pagination.Last
            onClick={() => goTo(totalPages)}
            disabled={page === totalPages}
          />
        )}
      </Pagination>
    </div>
  );
}
