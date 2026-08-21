'use client';

import { Button } from '@/components/ui/button';

export function CvPreviewContent() {
  const handleExportPdf = () => {
    // for now
    window.print();
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-6 pt-8 pb-3 text-foreground">
      <header className="mb-8 flex justify-between items-baseline">
        <div>
          <h1 className="text-[34px] tracking-tight">Rostislav Harlanov</h1>
          <p className="text-[16px] uppercase leading-[1.5] tracking-[0.01em]">
            Software Engineer
          </p>
        </div>

        <Button
          variant="primaryV2"
          onClick={handleExportPdf}
          className="w-[160px] h-[40px]"
        >
          Export PDF
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8 grid-cols-12 text-[16px] mb-[51px]">
        <div className="space-y-4 col-span-4 py-4">
          <div>
            <h3 className="font-bold">Education</h3>
            <p className="mt-2">Computer Systems Design</p>
          </div>
          <div>
            <h3 className="font-bold">Language proficiency</h3>
            <p className="mt-2">English — C1</p>
          </div>
          <div>
            <h3 className="font-bold">Domains</h3>
            <p className="mt-2">IoT (Internet of Things)</p>
          </div>
        </div>
        <div className="border-l-1 border-primary pl-[25px] space-y-4.5 col-span-8 pt-4">
          <div>
            <h2 className="font-bold">
              Software Engineer with 5+ years of experience
            </h2>
            <p className="mt-[10px] leading-relaxed">
              Highly motivated and experienced Software Engineer with 5+ years
              of proven success in designing and developing complex software
              solutions. Adept at utilizing cutting-edge technologies such as
              React and Node.js to create user- friendly and scalable
              applications. Possesses a strong understanding of Computer Systems
              Design principles and methodologies. A results-oriented individual
              with a passion for delivering high-quality work and exceeding
              expectations. A strong team leader and mentor with a proven
              ability to guide and motivate others to achieve shared goals.
              Seeking a challenging and rewarding Software Engineer position
              where I can leverage my skills and experience to contribute to the
              success of a dynamic and innovative organization.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Programming languages</h3>
            <p className="mt-[10px]">JavaScript, TypeScript.</p>
          </div>
          <div>
            <h3 className="font-bold">Frontend</h3>
            <p className="mt-[10px]">React, Redux.</p>
          </div>
          <div>
            <h3 className="font-bold">Backend</h3>
            <p className="mt-[10px]">gRPC.</p>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-[34px] tracking-tight mb-[33px]">Projects</h2>
        <div className="grid grid-cols-1 gap-8 grid-cols-12 text-[16px] mb-[51px]">
          <div className="space-y-4 col-span-4 py-4">
            <div>
              <h3 className="font-bold uppercase text-primary">
                SaaS Media Platform
              </h3>
              <p className="mt-[10px]">
                A digital music, podcast, and video service that gives you
                access to millions of songs and other content from creators all
                over the world. The user can connect and manage service
                providers such as Spotify, Apple Music, Tidal and SoundCloud in
                a few clicks and play content from them.
              </p>
            </div>
          </div>

          <div className="border-l-1 border-primary pl-[25px] space-y-4.5 col-span-8 pt-4">
            <div>
              <h2 className="font-bold">Project roles</h2>
              <p className="mt-[10px] leading-relaxed">
                Frontend Developer, AI Developer
              </p>
            </div>
            <div>
              <h2 className="font-bold">Period</h2>
              <p className="mt-[10px] leading-relaxed">08.2023 – Till now</p>
            </div>
            <div>
              <h2 className="font-bold">Responsibilities</h2>
              <ul className="mt-[10px] list-disc pl-5 leading-relaxed marker:text-[12px]">
                <li>
                  Integrated Keycloak OAuth SSO login for seamless user
                  authentication;
                </li>
                <li>
                  Developed web components according to the Figma design system
                  to ensure a consistent and modern user interface;
                </li>
                <li>
                  Successfully managed and onboarded both wired and wireless IoT
                  devices, enabling real-time data streaming and control;
                </li>
                <li>
                  Collaborated with the development team to integrate with
                  third-party service providers;
                </li>
                <li>
                  Contributed to the overall success of the project by
                  implementing robust security measures and optimizing
                  performance.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-bold">Environment</h2>
              <p className="mt-[10px] leading-relaxed">
                TypeScript, React, Redux, Redux Toolkit, RTK Query, Radix UI,
                gRPC, Keycloak.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-[34px] tracking-tight mb-[33px]">
          Professional skills
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-primary uppercase align-sub">
                <th className="pt-2.5 pb-8 pl-4 w-1/3 font-medium">Skills</th>
                <th className="pt-2.5 pb-8 w-1/3 font-medium"></th>
                <th className="pt-2.5 text-center w-[114px] font-medium">
                  Experience in years
                </th>
                <th className="pt-2.5 pb-8 text-center font-medium">
                  Last used
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              <tr className="align-sub">
                <td className="pt-2.5 pb-7 pl-4  text-primary">
                  Programming languages
                </td>
                <td className="pt-2.5 pb-7 flex flex-col items-start gap-5">
                  <span>TypeScript</span>
                  <span>JavaScript</span>
                </td>
                <td className="pt-2.5 pb-7 text-center font-normal">2</td>
                <td className="pt-2.5 pb-7 text-center font-normal">2025</td>
              </tr>
              <tr className="align-sub">
                <td className="pt-2.5 pb-7 pl-4 text-primary">
                  Frontend technologies
                </td>
                <td className="pt-2.5 pb-7 flex flex-col items-start gap-5">
                  React
                </td>
                <td className="pt-2.5 pb-7 text-center font-normal">2</td>
                <td className="pt-2.5 pb-7 text-center font-normal">2025</td>
              </tr>
              <tr className="align-sub">
                <td className="pt-2.5 pb-7 pl-4 text-primary">
                  State management libraries
                </td>
                <td className="pt-2.5 pb-7 flex flex-col items-start gap-5">
                  Redux
                </td>
                <td className="pt-2.5 pb-7 text-center font-normal">2</td>
                <td className="pt-2.5 pb-7 text-center font-normal">2025</td>
              </tr>
              <tr className="align-sub">
                <td className="pt-2.5 pb-7 pl-4 text-primary">
                  Backend technologies
                </td>
                <td className="pt-2.5 pb-7 flex flex-col items-start gap-5">
                  gRPC
                </td>
                <td className="pt-2.5 pb-7 text-center font-normal">2</td>
                <td className="pt-2.5 pb-7 text-center font-normal">2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
