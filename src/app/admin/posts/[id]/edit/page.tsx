import PostEditor from '@/components/admin/PostEditor';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: EditPostPageProps) {
  return (
    <div>
      <PostEditor postId={params.id} isEditing={true} />
    </div>
  );
}