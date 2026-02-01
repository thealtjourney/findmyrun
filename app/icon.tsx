import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF5F3',
          borderRadius: '7px',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M15 40 Q25 15 35 32 Q45 48 50 25"
            stroke="#FF6B5B"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="15" cy="40" r="4" fill="#FF6B5B" />
          <circle cx="50" cy="25" r="4" fill="#2D2D2D" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
