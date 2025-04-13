
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { motion } from 'framer-motion'

const faqItems = [
  {
    question: "How do I list my business?",
    answer:
      "Simply create an account, go to your dashboard, and click on 'Add Business'. Fill out the form and submit for review.",
  },
  {
    question: "Is there a cost to be listed?",
    answer:
      "Basic listings are free! Premium features such as homepage banners or highlighted results are optional add-ons.",
  },
  {
    question: "How do customers find my business?",
    answer:
      "Customers can search by category, location, and keywords. Our AI also recommends your business to relevant users.",
  },
  {
    question: "Can I update my business info anytime?",
    answer:
      "Yes, just log into your dashboard and you can edit your business details whenever you need.",
  },
  {
    question: "What makes Trompo different?",
    answer:
      "Trompo is built specifically for small and local businesses in the Philippines, with hyperlocal features and a focus on visibility."
  }
]

export default function FAQ() {
  return (
    <section className="py-24 md:py-32 bg-muted/30 border-t">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Need help? These common questions might have the answer.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <AccordionItem value={`faq-${i}`} className="border border-border rounded-lg px-4 py-2">
                <AccordionTrigger className="text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
