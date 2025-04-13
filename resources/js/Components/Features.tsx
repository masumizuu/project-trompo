import { LuBrain, LuCloud, LuShield, LuZap } from "react-icons/lu"

const features = [
  {
    name: "AI-Powered Analytics",
    description: "Harness the power of machine learning to derive actionable insights from your data.",
    icon: LuBrain,
  },
  {
    name: "Cloud-Native Architecture",
    description: "Scalable, resilient, and efficient solutions built for the modern cloud ecosystem.",
    icon: LuCloud,
  },
  {
    name: "Enterprise-Grade Security",
    description: "State-of-the-art security measures to protect your most valuable assets.",
    icon: LuShield,
  },
  {
    name: "High-Performance Systems",
    description: "Optimized for speed and efficiency, our solutions deliver unparalleled performance.",
    icon: LuZap,
  },
]

export default function Features() {
  return (
    <section
      className="w-full bg-cover bg-center bg-no-repeat text-white py-24 md:py-32"
      style={{
        backgroundImage: `url('https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAv3ZS1IiErs3n1zaS5yfkedHGXplgBAYjcM0x')`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 space-y-16">
        <div className="text-center">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
            Cutting-Edge Solutions
          </h2>
          <p className="mt-4 text-white/70 sm:text-lg">
            Discover how Amane Soft can transform your business with our innovative technologies.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30 p-8 backdrop-blur"
            >
              <div className="flex items-center gap-4">
                <feature.icon className="h-8 w-8 text-white" />
                <h3 className="font-bold">{feature.name}</h3>
              </div>
              <p className="mt-2 text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
