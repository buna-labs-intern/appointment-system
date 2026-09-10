type Props = {
  rows?: number
}

export default function SkeletonTableRows({ rows = 6 }: Props) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index}>
          {Array.from({ length: 5 }, (_, cell) => (
            <td key={cell} className="px-5 py-4">
              <div
                className="skeleton h-4"
                style={{ width: cell === 0 ? '65%' : '38%' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
