import { useEffect, useRef } from 'react'

export default function Scene() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let animId
        let w = canvas.width = window.innerWidth
        let h = canvas.height = window.innerHeight

        const PARTICLE_COUNT = 120
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.2 + 0.3,
            dx: (Math.random() - 0.5) * 0.18,
            dy: (Math.random() - 0.5) * 0.18,
            alpha: Math.random() * 0.4 + 0.1,
        }))

        function draw() {
            ctx.clearRect(0, 0, w, h)
            for (const p of particles) {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(230, 126, 34, ${p.alpha})`
                ctx.fill()

                p.x += p.dx
                p.y += p.dy
                if (p.x < 0) p.x = w
                if (p.x > w) p.x = 0
                if (p.y < 0) p.y = h
                if (p.y > h) p.y = 0
            }
            animId = requestAnimationFrame(draw)
        }

        draw()

        const onResize = () => {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return (
        <div className="fixed inset-0 -z-10 bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,153,51,0.05),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(19,136,8,0.05),transparent_50%)]" />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.7 }}
            />
        </div>
    )
}
