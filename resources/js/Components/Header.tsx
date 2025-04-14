import { useEffect, useState } from "react"
import { Link } from "@inertiajs/react"
import { LuMoon, LuSun, LuMenu, LuX } from "react-icons/lu"
import Button from "@/Components/PrimaryButton"
import { useTheme } from "@/lib/use-theme" // We'll set this up too

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "bg-secondary/30" : "bg-[#c20d03]"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold">
          <div className="justify-center items-center">
            <img
              src="https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLANMxcFE3z2DIfTlPUCYsrNvO071GK4wjVQ9gB"
              alt="Trompo Logo"
              className="size-8 rounded-lg object-cover"
            />
          </div>
          <span className="text-white">Trompo</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {["stores", "sellables", "about", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm font-medium text-white transition hover:text-foreground"
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleTheme} className="rounded-full p-2 text-white dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700">
            {theme === "dark" ? <LuMoon className="size-[18px]" /> : <LuSun className="size-[18px]" />}
            <span className="sr-only">Toggle theme</span>
          </button>
          <Link
            href={route("login")}
            className="text-sm font-medium text-white transition hover:text-foreground"
          >
            Log in
          </Link>
          <Button className="rounded-full">
            <Link href={route("register")}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleTheme} className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === "dark" ? <LuSun className="size-[18px]" /> : <LuMoon className="size-[18px]" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b">
          <div className="container py-4 flex flex-col gap-4">
            {["stores", "sellables", "about", "contact"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href={route("login")} className="py-2 text-sm font-medium">
                Log in
              </Link>
              <Button className="rounded-full">
                <Link href={route("register")}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
