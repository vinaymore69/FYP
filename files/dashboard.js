document.querySelectorAll('.dashboard-options-element').forEach(button => {
    button.addEventListener('click', function () {
        const file = this.getAttribute('data-file'); // HTML content file
        const cssFile = file.replace('.html', '.css'); // Corresponding CSS file
        const jsFile = file.replace('.html', '.js'); // Corresponding JS file

        // Fetch the HTML content
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Unable to load ${file}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                // Replace the content inside #dashboard-content
                const contentArea = document.getElementById('dashboard-content');
                contentArea.innerHTML = data;

                // Load the corresponding CSS file
                const existingCss = document.getElementById('dynamic-css');
                if (existingCss) existingCss.remove();

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile;
                link.id = 'dynamic-css';
                document.head.appendChild(link);

                // Load the corresponding JS file
                const existingScript = document.getElementById('dynamic-js');
                if (existingScript) existingScript.remove();

                const script = document.createElement('script');
                script.src = jsFile;
                script.id = 'dynamic-js';
                document.body.appendChild(script);
            })
            .catch(error => {
                console.error('Error loading content:', error);
                document.getElementById('dashboard-content').innerHTML = '<p>Content not found.</p>';
            });
    });
});
