import { CvSkillsContent } from '@/features/cvs/components/CvSkillsContent';

type CvSkillsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CvSkillsPage({ params }: CvSkillsPageProps) {
  const { id } = await params;
  return <CvSkillsContent cvId={id} />;
}
