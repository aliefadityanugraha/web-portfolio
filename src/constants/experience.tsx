import {
  BentoSkeleton,
  BentoSkeletonWide,
  type BentoGridItemProps,
} from "@/components/BentoGrid";
import { getImage } from "astro:assets";
import { BsPersonBadgeFill } from "solid-icons/bs";
import {
  FaBrandsGithub,
  FaSolidMoneyBill,
} from "solid-icons/fa";
import { FiExternalLink } from "solid-icons/fi";
import { ImLibrary } from "solid-icons/im";
import rustScript from "../assets/RustScript.png";
import rspack from "../assets/rspack.svg";
import { SiNodedotjs, SiLaravel } from "solid-icons/si";

// Optimise images at build time
const rustScriptPng = await getImage({
  src: rustScript,
  format: "webp",
});

const rspackSvg = await getImage({
  src: rspack,
});

export const projects: BentoGridItemProps[] = [
  {
    header: (
      <FaSolidMoneyBill class="w-24 h-24 m-auto opacity-70 group-hover/bento:rotate-3 transition-all" />
    ),
    title: "Expense Tracker iOS App",
    icon: (
      <a
        href="https://github.com/wxiaoyun/expense-tracker"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github repository for Expense Tracker"
      >
        <FaBrandsGithub class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description:
      "A desktop and iOS expense tracking application built with Tauri and SolidJS. Features include transaction management, recurring payments, financial analytics with interactive charts, automated processing via clipboard commands, and local SQLite storage with backup/restore functionality.",
    class: "bg-card sm:col-span-2",
  },
  {
    header: (
      <BsPersonBadgeFill class="w-24 h-24 m-auto opacity-70 group-hover/bento:rotate-3 transition-all" />
    ),
    title: "Portfolio",
    icon: (
      <a
        href="https://github.com/wxiaoyun/wxiaoyun.github.io"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github repository for portfolio"
      >
        <FaBrandsGithub class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description:
      "The current portfolio you are viewing. A minimalist design with a focus on responsive UI.  Built with Astro, Solidjs and Shadcn UI.",
    class: "bg-card",
  },
  BentoSkeleton,
  {
    header: (
      <img
        src={rustScriptPng.src}
        alt="Rustscript logo"
        width={96}
        height={96}
        class="m-auto group-hover/bento:rotate-3 transition-all rounded-md"
      />
    ),
    title: "Rustscript",
    icon: (
      <a
        href="https://github.com/crabscript/rustscript"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github repository for Rustscript"
      >
        <FaBrandsGithub class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description:
      "Developed a statically typed, compiled programming language combining Rust's syntax with the simplicity of TypeScript and Go with core features including primitive data types, higher-order functions, type checking, concurrency and garbage collector. The language to compile code into bytecode, akin to Java, followed by execution on a virtual machine.",
    class: "bg-card sm:col-span-2",
  },
  {
    header: (
      <ImLibrary class="w-24 h-24 m-auto opacity-70 group-hover/bento:rotate-3 transition-all" />
    ),
    title: "Cambodia Community Library",
    icon: (
      <a
        href="https://github.com/wxiaoyun/lms-backend"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github repository for Cambodia Community Library"
      >
        <FaBrandsGithub class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description:
      "Solo built a full stack Library Management System with role based access control for a village located at Cambodia. It is a two year school project aimed to improve literacy level in Ou Ruessei, a village located at Cambodia.",
    class: "bg-card sm:col-span-2",
  },
  BentoSkeleton,
];

export const openSourceContrib: BentoGridItemProps[] = [
  {
    header: (
      <img
        src={rspackSvg.src}
        alt="Rspack logo"
        width={96}
        height={96}
        class="m-auto group-hover/bento:rotate-3 transition-all rounded-md"
      />
    ),
    title: "Rspack",
    icon: (
      <a
        href="https://www.rspack.dev/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Rspack website"
      >
        <FiExternalLink class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description:
      "Made contribution to Webpack alignments and Javascript to Typescript migrations.",
    class: "bg-card",
  },
  BentoSkeletonWide,
];

export const professionalExperiences: BentoGridItemProps[] = [
  {
    header: (
      <SiNodedotjs class="w-24 h-24 m-auto opacity-70 group-hover/bento:rotate-3 transition-all" />
    ),
    title: "Full‑Stack Developer (Personal Project: appsch)",
    icon: (
      <a href="#projects" aria-label="Projects section">
        <FiExternalLink class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description: (
      <ul class="list-inside list-disc">
        <li>
          Membangun dan mengembangkan aplikasi appsch dengan stack Node.js,
          Express.js, dan Next.js.
        </li>
        <li>
          Mendesain REST API, autentikasi JWT, dan integrasi database
          (MySQL/MongoDB).
        </li>
        <li>
          Mengimplementasikan UI dengan Tailwind CSS serta deployment di
          Vercel/Nginx.
        </li>
      </ul>
    ),
    class: "bg-card sm:col-span-2",
    footer: (
      <small class="text-xs text-muted-foreground">2024 - sekarang</small>
    ),
  },
  {
    header: (
      <SiLaravel class="w-24 h-24 m-auto opacity-70 group-hover/bento:rotate-3 transition-all" />
    ),
    title: "Backend Developer (Laravel & Express)",
    icon: (
      <a href="#projects" aria-label="Projects section">
        <FiExternalLink class="hover:opacity-65 transition-opacity" />
      </a>
    ),
    description: (
      <ul class="list-inside list-disc">
        <li>
          Membangun modul CRUD, middleware, dan role‑based access control di
          Laravel.
        </li>
        <li>
          Migrasi endpoint ke Express.js untuk meningkatkan kinerja dan
          kesederhanaan deployment.
        </li>
        <li>
          Integrasi Firebase untuk autentikasi/penyimpanan file, serta
          monitoring dasar.
        </li>
      </ul>
    ),
    class: "bg-card sm:col-span-2",
    footer: <small class="text-xs text-muted-foreground">2023 - 2024</small>,
  },
];
