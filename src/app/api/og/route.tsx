import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'XSMB 24h';
    const description = searchParams.get('description') || 'Kết quả xổ số miền Bắc trực tiếp';
    const date = searchParams.get('date');

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
                    backgroundColor: '#fff',
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '40px 80px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div
                            style={{
                                fontSize: 40,
                                fontWeight: 900,
                                color: '#dc2626',
                                marginRight: '10px',
                            }}
                        >
                            XSMB 24H
                        </div>
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 60,
                            fontWeight: 800,
                            color: '#1e293b',
                            textAlign: 'center',
                            marginBottom: '10px',
                            maxWidth: '900px',
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </div>

                    {/* Description or Date */}
                    <div
                        style={{
                            fontSize: 30,
                            fontWeight: 500,
                            color: '#64748b',
                            textAlign: 'center',
                        }}
                    >
                        {date ? `Kỳ quay: ${date}` : description}
                    </div>

                    {/* Footer decoration */}
                    <div
                        style={{
                            marginTop: '30px',
                            display: 'flex',
                            gap: '10px',
                        }}
                    >
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f87171' }} />
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
