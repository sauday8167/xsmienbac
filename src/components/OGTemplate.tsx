import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function OGTemplate({
    title,
    subtitle = 'Kết quả Xổ số Miền Bắc - Chính xác - Nhanh chóng',
}: {
    title: string;
    subtitle?: string;
}) {
    // Basic OG Image Size
    const width = 1200;
    const height = 630;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #991b1b, #7f1d1d)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background Pattern (Subtle Circles) */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        left: '-100px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-100px',
                        right: '-100px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                    }}
                />

                {/* Main Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center',
                        zIndex: 10,
                    }}
                >
                    {/* Logo / Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fbbf24', // Amber-400
                            color: '#7f1d1d',
                            fontSize: 32,
                            fontWeight: 900,
                            padding: '10px 30px',
                            borderRadius: '50px',
                            marginBottom: '40px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                    >
                        XSMB
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: '30px',
                            textShadow: '0 4px 8px rgba(0,0,0,0.4)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            backgroundImage: 'linear-gradient(to bottom, #ffffff, #fcd34d)', // White to Amber
                        }}
                    >
                        {title}
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: 32,
                            color: '#e5e7eb', // Gray-200
                            maxWidth: '900px',
                            fontWeight: 500,
                            opacity: 0.9,
                        }}
                    >
                        {subtitle}
                    </div>
                </div>

                {/* Footer Bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '20px',
                        background: '#fbbf24',
                    }}
                />
            </div>
        ),
        {
            width,
            height,
        }
    );
}
