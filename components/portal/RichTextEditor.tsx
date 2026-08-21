'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { useEffect } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Link2, Link2Off, Undo2, Redo2,
} from 'lucide-react'

interface Props {
  /** Stored HTML. Legacy plain-text bios are converted by the caller. */
  value: string
  /** Fires with sanitize-on-save HTML plus the plain text, for the AI prompt. */
  onChange: (html: string, text: string) => void
  placeholder?: string
}

type ToolbarButton = {
  icon: React.ComponentType<{ size?: number }>
  label: string
  run: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
}

const GROUPS: ToolbarButton[][] = [
  [
    { icon: Bold, label: 'Bold', run: e => e.chain().focus().toggleBold().run(), isActive: e => e.isActive('bold') },
    { icon: Italic, label: 'Italic', run: e => e.chain().focus().toggleItalic().run(), isActive: e => e.isActive('italic') },
    { icon: Underline, label: 'Underline', run: e => e.chain().focus().toggleUnderline().run(), isActive: e => e.isActive('underline') },
    { icon: Strikethrough, label: 'Strikethrough', run: e => e.chain().focus().toggleStrike().run(), isActive: e => e.isActive('strike') },
  ],
  [
    { icon: List, label: 'Bulleted list', run: e => e.chain().focus().toggleBulletList().run(), isActive: e => e.isActive('bulletList') },
    { icon: ListOrdered, label: 'Numbered list', run: e => e.chain().focus().toggleOrderedList().run(), isActive: e => e.isActive('orderedList') },
    { icon: Quote, label: 'Quote', run: e => e.chain().focus().toggleBlockquote().run(), isActive: e => e.isActive('blockquote') },
  ],
  [
    { icon: Undo2, label: 'Undo', run: e => e.chain().focus().undo().run() },
    { icon: Redo2, label: 'Redo', run: e => e.chain().focus().redo().run() },
  ],
]

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Headings would let an agent out-shout the page's own headings.
        heading: { levels: [3, 4] },
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    // Next renders this on the server first; without it React logs a hydration
    // mismatch because ProseMirror decorates the DOM on mount.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-editor focus:outline-none min-h-[11rem] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
  })

  // The admin panel mounts this with another agent's bio; without this the
  // editor would keep showing whoever was loaded first.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return <div className="min-h-[13.5rem] bg-white/5 border border-white/10 rounded-lg" />
  }

  function toggleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Link URL (https://…)')
    if (!url) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg focus-within:border-gold/50 transition overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-2 py-1.5">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {gi > 0 && <span className="w-px h-4 bg-white/10 mx-1" />}
            {group.map(btn => {
              const active = btn.isActive?.(editor) ?? false
              const Icon = btn.icon
              return (
                <button
                  key={btn.label}
                  type="button"
                  title={btn.label}
                  aria-label={btn.label}
                  aria-pressed={active}
                  onClick={() => btn.run(editor)}
                  className={`p-1.5 rounded transition ${
                    active ? 'bg-gold/20 text-gold' : 'text-white/45 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={14} />
                </button>
              )
            })}
          </div>
        ))}
        <span className="w-px h-4 bg-white/10 mx-1" />
        <button
          type="button"
          title={editor.isActive('link') ? 'Remove link' : 'Add link'}
          aria-label={editor.isActive('link') ? 'Remove link' : 'Add link'}
          onClick={toggleLink}
          className={`p-1.5 rounded transition ${
            editor.isActive('link') ? 'bg-gold/20 text-gold' : 'text-white/45 hover:text-white hover:bg-white/10'
          }`}
        >
          {editor.isActive('link') ? <Link2Off size={14} /> : <Link2 size={14} />}
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
