import { useState, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadImage } from '../api/upload';

const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

const buttonClass =
  'py-1.5 px-2.5 text-sm font-medium text-secondary-200 bg-secondary-800 border border-secondary-600 rounded hover:bg-secondary-700 focus:outline-none focus:ring-1 focus:ring-primary-400/50';

function Toolbar({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    e.target.value = '';
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border border-secondary-600 border-b-0 rounded-t-lg bg-secondary-800/50">
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`${buttonClass} ${editor?.isActive('bold') ? 'bg-primary-600/30 border-primary-500' : ''}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${editor?.isActive('italic') ? 'bg-primary-600/30 border-primary-500' : ''}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${editor?.isActive('bulletList') ? 'bg-primary-600/30 border-primary-500' : ''}`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary-600/30 border-primary-500' : ''}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!editor || uploading}
        className={buttonClass}
      >
        {uploading ? 'Uploading…' : 'Insert image'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

interface BlogRichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function BlogRichEditor({ value, onChange }: BlogRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] py-2 px-3 prose prose-invert max-w-none focus:outline-none',
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file?.type.startsWith('image/')) return false;
        event.preventDefault();
        uploadImage(file)
          .then(({ url }) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            }
          })
          .catch((err) => alert(err instanceof Error ? err.message : 'Upload failed'));
        return true;
      },
      handlePaste(view, event) {
        const file = event.clipboardData?.files?.[0];
        if (!file?.type.startsWith('image/')) return false;
        event.preventDefault();
        uploadImage(file)
          .then(({ url }) => {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          })
          .catch((err) => alert(err instanceof Error ? err.message : 'Upload failed'));
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div>
      <span className={labelClass}>Article content</span>
      <p className="text-xs text-secondary-500 mb-1">
        Write your post below. Use the toolbar for bold, lists, and headings. Click &quot;Insert image&quot; or drag and drop / paste images to upload.
      </p>
      <Toolbar editor={editor} />
      <div className="rounded-b-lg border border-secondary-600 border-t-0 min-h-[220px] bg-secondary-900 [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:p-3 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
