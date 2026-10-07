import React, { useRef, useEffect, useState } from 'react'

const RichTextEditor = ({
    onChange,
    data,
    placeholder = "Describe what students will learn...",
    height = "300px",
    className = ""
}) => {
    const editorRef = useRef(null)
    const isTyping = useRef(false)

    const [isFocused, setIsFocused] = useState(false)
    const [isEmpty, setIsEmpty] = useState(true)

    // Sync external data safely
    useEffect(() => {
        const editor = editorRef.current
        if (!editor) return

        if (!isTyping.current && editor.innerHTML !== data) {
            editor.innerHTML = data || ""
            setIsEmpty(!data)
        }
    }, [data])

    // Attach listeners once
    useEffect(() => {
        const editor = editorRef.current
        if (!editor) return

        const handleInput = () => {
            const html = editor.innerHTML
            isTyping.current = true
            setIsEmpty(html === "" || html === "<br>")
            if (onChange) onChange(html)
        }

        const handleFocus = () => setIsFocused(true)
        const handleBlur = () => {
            setIsFocused(false)
            isTyping.current = false
        }

        editor.addEventListener('input', handleInput)
        editor.addEventListener('focus', handleFocus)
        editor.addEventListener('blur', handleBlur)

        return () => {
            editor.removeEventListener('input', handleInput)
            editor.removeEventListener('focus', handleFocus)
            editor.removeEventListener('blur', handleBlur)
        }
    }, [onChange])

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        editorRef.current.focus()
    }

    const formatText = (command) => execCommand(command)

    const insertElement = (type) => {
        switch (type) {
            case 'link':
                const url = prompt('Enter the URL:')
                if (url) execCommand('createLink', url)
                break
            case 'image':
                const imageUrl = prompt('Enter the image URL:')
                if (imageUrl) execCommand('insertImage', imageUrl)
                break
            case 'hr':
                execCommand('insertHorizontalRule')
                break
            default:
                break
        }
    }

    const clearFormatting = () => execCommand('removeFormat')

    const setHeading = (level) => {
        if (!level) execCommand('formatBlock', 'p')
        else execCommand('formatBlock', `h${level}`)
    }

    return (
        <div className={`rich-text-editor border border-gray-300 rounded-lg overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2">
                <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200"><b>B</b></button>
                    <button type="button" onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200"><i>I</i></button>
                    <button type="button" onClick={() => formatText('underline')} className="p-2 hover:bg-gray-200"><u>U</u></button>

                    <select
                        onChange={(e) => setHeading(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        defaultValue=""
                    >
                        <option value="">Normal</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                    </select>

                    <button type="button" onClick={() => formatText('insertUnorderedList')} className="p-2 hover:bg-gray-200">• List</button>
                    <button type="button" onClick={() => formatText('insertOrderedList')} className="p-2 hover:bg-gray-200">1. List</button>

                    <button type="button" onClick={() => insertElement('link')} className="p-2 hover:bg-gray-200">Link</button>
                    <button type="button" onClick={() => insertElement('image')} className="p-2 hover:bg-gray-200">Image</button>
                    <button type="button" onClick={() => insertElement('hr')} className="p-2 hover:bg-gray-200">HR</button>

                    <button type="button" onClick={clearFormatting} className="p-2 hover:bg-gray-200">Clear</button>
                </div>
            </div>

            {/* Editor */}
            <div className="relative">
                <div
                    ref={editorRef}
                    role="textbox"
                    aria-label="Course description"
                    aria-multiline="true"
                    contentEditable
                    suppressContentEditableWarning
                    className="editor-content min-h-[200px] p-4 outline-none bg-background text-foreground"
                    style={{
                        height,
                        direction: "ltr",
                        unicodeBidi: "plaintext",
                        textAlign: "left"
                    }}
                />

                {isEmpty && !isFocused && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    )
}

export default RichTextEditor