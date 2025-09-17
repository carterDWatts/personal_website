// Load and display all published articles
async function loadArticles() {
    try {
        // Get list of article files (you'll need to maintain this list or use a build process)
        const articleFiles = await getArticleFiles();
        const articles = [];
        
        // Load each article file
        for (const filename of articleFiles) {
            try {
                const response = await fetch(`articles/${filename}`);
                const article = await response.json();
                
                // Only include published articles
                if (article.published) {
                    article.filename = filename;
                    articles.push(article);
                }
            } catch (error) {
                console.warn(`Failed to load article: ${filename}`, error);
            }
        }
        
        // Sort by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayArticles(articles);
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('articles-list').innerHTML = '<p>Unable to load articles.</p>';
    }
}

async function getArticleFiles() {
    try {
        // Fetch the articles directory listing from GitHub API
        const response = await fetch('https://api.github.com/repos/carterdwatts/carterdwatts.github.io/contents/articles');
        const files = await response.json();
        
        // Filter for JSON files only
        return files
            .filter(file => file.name.endsWith('.json'))
            .map(file => file.name);
    } catch (error) {
        console.warn('Could not auto-discover articles, using fallback method');
        // Fallback: try common naming patterns
        const attempts = [];
        for (let i = 1; i <= 100; i++) {
            const filename = `article-${String(i).padStart(3, '0')}.json`;
            attempts.push(filename);
        }
        
        // Test which files actually exist
        const existingFiles = [];
        for (const filename of attempts) {
            try {
                const testResponse = await fetch(`articles/${filename}`, { method: 'HEAD' });
                if (testResponse.ok) {
                    existingFiles.push(filename);
                }
            } catch (e) {
                // File doesn't exist, continue
            }
        }
        
        return existingFiles;
    }
}

function displayArticles(articles) {
    const container = document.getElementById('articles-list');
    
    if (articles.length === 0) {
        container.innerHTML = '<p>No articles published yet.</p>';
        return;
    }
    
    container.innerHTML = articles.map(article => `
        <article class="article-card" onclick="openArticle('${article.filename}')">
            <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
            <div class="article-card-meta">
                By ${escapeHtml(article.author)} • ${escapeHtml(article.date)}
            </div>
            <div class="article-card-excerpt">
                ${escapeHtml(article.excerpt)}
            </div>
        </article>
    `).join('');
}

function openArticle(filename) {
    window.location.href = `article.html?file=${filename}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load articles when page loads
document.addEventListener('DOMContentLoaded', loadArticles);
