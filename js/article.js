// Load and display individual article
async function loadArticle() {
    try {
        // Get filename from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const filename = urlParams.get('file');
        
        if (!filename) {
            throw new Error('No article specified');
        }
        
        // Load the article
        const response = await fetch(`articles/${filename}`);
        if (!response.ok) {
            throw new Error('Article not found');
        }
        
        const article = await response.json();
        
        if (!article.published) {
            throw new Error('Article not published');
        }
        
        displayArticle(article);
        
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('article-content').innerHTML = `
            <div class="article-header">
                <a href="/" class="back-link">← Back to Home</a>
                <h1>Article Not Found</h1>
                <p>The requested article could not be loaded.</p>
            </div>
        `;
    }
}

function displayArticle(article) {
    // Update page title
    document.getElementById('page-title').textContent = `${article.title} - Carter Watts`;
    
    // Format content (convert line breaks to paragraphs)
    const formattedContent = article.content
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');
    
    // Display article
    document.getElementById('article-content').innerHTML = `
        <a href="/" class="back-link">← Back to Home</a>
        
        <header class="article-header">
            <h1 class="article-title">${escapeHtml(article.title)}</h1>
            <div class="article-meta">
                By ${escapeHtml(article.author)} • ${escapeHtml(article.date)}
            </div>
            <div class="article-excerpt">
                ${escapeHtml(article.excerpt)}
            </div>
        </header>
        
        <div class="article-content">
            ${formattedContent}
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load article when page loads
document.addEventListener('DOMContentLoaded', loadArticle);
