import { LuBriefcase, LuEye, LuUsers } from "react-icons/lu"
import { motion } from "framer-motion"

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Sign Up",
      description: "Create your free account and set up your business profile in just a few clicks.",
      icon: <LuBriefcase className="size-5 text-primary" />,
    },
    {
      step: "02",
      title: "Showcase Your Business",
      description: "Add your products, services, and contact info so people can find and reach you.",
      icon: <LuEye className="size-5 text-primary" />,
    },
    {
      step: "03",
      title: "Connect with Customers",
      description: "Start getting discovered, reviewed, and contacted by new local customers.",
      icon: <LuUsers className="size-5 text-primary" />,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="w-full py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black 
        bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
        dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] 
        bg-[size:4rem_4rem] mask-image-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"
      />

      <div className="container px-4 md:px-6 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            A Simple Process to Get Started
          </h2>
          <p className="text-muted-foreground text-lg">
            Easily get your business online and start attracting new local customers in just three easy steps.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-12 md:grid-cols-3 relative"
        >
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border/40 -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative z-10 text-center flex flex-col items-center space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shadow-md">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
