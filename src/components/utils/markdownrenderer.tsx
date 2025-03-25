import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // First level of sanitization with DOMPurify
    const sanitizedContent = DOMPurify.sanitize(content);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
                a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props} />
                )
            }}
        >
            {sanitizedContent}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
