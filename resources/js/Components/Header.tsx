import { useEffect, useState } from "react"
import { Link } from "@inertiajs/react"
import { LuMoon, LuSun, LuMenu, LuX } from "react-icons/lu"
import Button from "@/Components/PrimaryButton"
import { useTheme } from "@/lib/use-theme" // We'll set this up too
import Dropdown from "./Dropdown"

export default function Header({ user }: { user?: { name: string; profile_photo_url?: string } }) {
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
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-white dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? <LuMoon className="size-[18px]" /> : <LuSun className="size-[18px]" />}
            <span className="sr-only">Toggle theme</span>
          </button>

          {user ? (
            <>
              <Link href={route("dashboard")} className="text-sm font-medium text-white hover:text-foreground">
                Dashboard
              </Link>

              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex rounded-md">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                    >
                      {user.name}
                      <svg
                        className="-me-0.5 ms-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <Dropdown.Link href={route("profile.edit")}>Profile</Dropdown.Link>
                  <Dropdown.Link href={route("logout")} method="post" as="button">
                    Log Out
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </>
          ) : (
            <>
              <Link href={route("login")} className="text-sm font-medium text-white transition hover:text-foreground">
                Log in
              </Link>
              <Button className="rounded-full">
                <Link href={route("register")}>Get Started</Link>
              </Button>
            </>
          )}
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
              {user ? (
                <>
                  <Link href={route("dashboard")} className="py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href={route("profile.edit")} className="py-2 text-sm font-medium">
                    Profile
                  </Link>
                  <form method="POST" action={route("logout")}>
                    <button
                      type="submit"
                      className="py-2 text-sm font-medium text-left w-full text-red-600"
                    >
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href={route("login")} className="py-2 text-sm font-medium">
                    Log in
                  </Link>
                  <Button className="rounded-full">
                    <Link href={route("register")}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  )
}
