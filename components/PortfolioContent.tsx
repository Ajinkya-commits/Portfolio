import { AboutSection } from "./sections/AboutSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { ContactSection } from "./sections/ContactSection";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectSection";
import { SkillsSection } from "./sections/SkillsSection";

function PortfolioContent() {
  return (
    <>
      <HeroSection />
      <AboutSection />
       <SkillsSection />
       <ExperienceSection/>
       <EducationSection />
       <ProjectsSection />
       {/* <CertificationsSection /> */}
       <ContactSection/>
    </>
  );
}

export default PortfolioContent;
