"use client"

import { Button } from "@headlessui/react"
import { useState, useEffect } from "react"

const images = [
  "https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLACoe9DtYKdyxZbR5I3Vjs4mo7lYPXcWkGO26p",
]

export function AutoSliderBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 10000) // Change image every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleShopClick = () => {
    const productSection = document.getElementById("product-section")
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src || "/placeholder.svg"}
            alt={`Banner ${index + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-[#c20d03] text-center mb-4">
          TROMPO
        </h1>
        <p className="text-xl text-[#c20d03] text-center mb-8 font-bold">the business directory for small and local businesses in the Philippines</p>
        <Button onClick={handleShopClick} className="text-lg py-2 px-4 border border-white text-[#c20d03] hover:bg-white hover:text-black transition-colors font-bold">
          Explore
        </Button>
      </div>
    </div>
  )
}