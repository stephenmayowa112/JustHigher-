import AdminNav from '@/components/admin/AdminNav';
import PostEditor from '@/components/admin/PostEditor';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: EditPostPageProps) {
  return (
    <div>
      <AdminNav />
      <PostEditor postId={params.id} isEditing={true} />
    </div>
  );
}