import { FaLinkedin } from "react-icons/fa"
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6"
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi"
import { Link } from "react-router-dom"

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: FaXTwitter, href: "https://x.com/folasade_ade?s=21", label: 'X' },
        { icon: FaFacebook, href: "https://www.facebook.com/shade.belloadepoju", label: 'Facebook' },
        { icon: FaInstagram, href: "https://www.instagram.com/folasade_adepoju?igsh=MW10MGh1Z3FlbWoxMA==", label: 'Instagram' },
        { icon: FaLinkedin, href: "https://www.linkedin.com/in/folasade-adepoju-89786b162/", label: 'LinkedIn' }
    ];

    const quickLinks = [
        { to: '/', label: 'Home' },
        { to: '/archive-items', label: 'Archives' },
        { to: "/collections", label: "Collections" },
        { to: '/#about', label: 'About Me' },
        { to: '/auth/login', label: 'Admin Login' }
    ];

    return (
        <footer className="bg-[#0047AB] mt-16 text-white font-[Roboto]">
            {/* Main Footer Content */}
            <div className="container mx-auto px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* About Section */}
                    <div>

                        {/* Name and logo */}
                        <div className="flex items-center space-x-2 mb-4">
                            {/* Logo */}
                            <Link to='/'>
                                <div className="rounded-b-3xl w-14 h-14 shadow-2xl flex justify-center items-center border-4 border-white/25">
                                    <span className="text-3xl font-bold text-[#f0f0f0]">FA</span>
                                </div>
                            </Link>
                            <span className="text-xl font-bold">Folasade Adepoju</span>
                        </div>
                        {/* Description */}
                        <p className="text-[#F0F0F0] text-sm leading-relaxed">
                            Creative professional sharing and documenting my journey
                            through multimedia projects, personal archives, meaningful, and important work.
                        </p>

                        {/* Social Media Links */}
                        <div className="mt-6 flex space-x-4">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"  // open in a new tab
                                    rel="noopener noreferrer" // for security and privacy
                                    aria-label={`Follow on ${label}`}
                                    className="text-[#f0f0f0] hover:text-amber-300 transition-all hover:scale-100"
                                >
                                    <Icon size={22} />
                                </a>
                            ))}
                        </div>

                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">Quick Links</h3>
                        <ul className="space-y-3">
                            {quickLinks.map(({ to, label }) => (
                                <li key={label}>
                                    <a
                                        href={to}
                                        className="text-[#F0F0F0] hover:text-[#FFD700] transition-colors text-sm flex items-center gap-2"
                                    >
                                        <span className="text-[#FFD700]">&rsaquo;</span>
                                        {label}
                                        {label === 'Admin Login' && (
                                            <span className="ml-2 px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs rounded-full border border-amber-400/40">
                                                Admin
                                            </span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">Contact Me</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-[#F0F0F0] text-sm">
                                <FiMapPin className="text-[#FFD700] mt-0.5 shrink-0" size={20} />
                                <span>Abuja, Federal Capital Territory,<br />Nigeria.</span>
                            </li>
                            <li className="flex items-center gap-3 text-[#F0F0F0] text-sm">
                                <FiPhone className="text-[#FFD700] shrink-0" size={18} />
                                <a href="tel:+2341234567890" className="hover:text-[#FFD700] transition-colors">
                                    +234 703 263 6297
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-[#F0F0F0] text-sm">
                                <FiMail className="text-[#FFD700] shrink-0" size={18} />
                                <a href="mailto:folasadeadepoju@gmail.com" className="hover:text-[#FFD700] transition-colors">
                                    folasadeadepoju@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 mt-10">
                <div className="container mx-auto px-4 py-6">
                    <p className="text-[#F0F0F0] text-sm text-center">
                        &copy; {currentYear} Folasade Adepoju. All rights reserved. |
                        <span className="ml-2 text-[#FFD700]">
                            <a
                                target="_blank"
                                href="https://vishtechinnovation.com.ng/contact-us/"
                                className="hover:underline">
                                Create yours here
                            </a>
                        </span>
                    </p>
                </div>
            </div>

        </footer>
    )
}

export default Footer










