import type { Metadata } from "next";
import Link from "next/link";
import { Almarai } from "next/font/google";
import { getPlatformSiteName } from "@/lib/platform-settings";
import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const siteUrl = "https://bayt-almosawer-platform-production.up.railway.app";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getPlatformSiteName();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description:
      "منصة عربية متخصصة في كورسات التصوير والإضاءة وصناعة المحتوى، مع تجربة تعليمية منظمة ولوحة تعلم للطلاب.",
    keywords: [
      "بيت المصور",
      "كورسات تصوير",
      "تعلم التصوير",
      "تصوير احترافي",
      "إضاءة استوديو",
      "صناعة المحتوى",
      "كورسات عربية",
      "دورات تصوير",
    ],
    authors: [
      {
        name: siteName,
      },
    ],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: siteUrl,
      siteName,
      title: siteName,
      description:
        "تعلّم التصوير والإضاءة وصناعة المحتوى من خلال كورسات عربية منظمة وتجربة تعليمية احترافية.",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description:
        "كورسات عربية احترافية في التصوير والإضاءة وصناعة المحتوى.",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function Footer() {
  const siteName = await getPlatformSiteName();
  const logoLetter = siteName.trim().charAt(0) || "ب";

  return (
    <footer className="mt-auto border-t border-[var(--border-soft)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-500)] to-[var(--brand-400)] text-white shadow-lg">
              <span className="text-base font-extrabold">{logoLetter}</span>
            </div>

            <div>
              <p className="font-extrabold">{siteName}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                تعلّم التصوير باحترافية وتنظيم.
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            منصة عربية متخصصة في كورسات التصوير، الإضاءة، وصناعة المحتوى،
            مصممة لتقديم تجربة تعليمية واضحة ومنظمة للطلاب.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            الرئيسية
          </Link>

          <Link
            href="/courses"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            الكورسات
          </Link>

          <Link
            href="/contact"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            تواصل معنا
          </Link>

          <Link
            href="/privacy"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            سياسة الخصوصية
          </Link>

          <Link
            href="/terms"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            الشروط والأحكام
          </Link>

          <Link
            href="/refund-policy"
            className="text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--brand-600)]"
          >
            سياسة الاسترداد
          </Link>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)] px-5 py-4 text-center text-xs font-bold text-[var(--text-muted)] sm:px-8 lg:px-20">
        © {new Date().getFullYear()} {siteName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${almarai.variable} flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]`}
      >
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}