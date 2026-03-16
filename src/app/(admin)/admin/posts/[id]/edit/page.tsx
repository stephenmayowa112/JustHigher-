import PostEditor from '@/components/admin/PostEditor';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPost({ params }: EditPostPageProps) {
  const { id } = await params;
  
  return (
    <div>
      <PostEditor postId={id} isEditing={true} />
    </div>
  );
}