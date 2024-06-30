document.addEventListener('DOMContentLoaded', function() {
    const imageList = document.getElementById('image-list');
    const loading = document.getElementById('loading');
    // const menuButtons = document.querySelectorAll('.get-image-menu');
    let imageType = 'recent';
    let first_row = 1;
    const row_count = 10;

    const loadImage = (container, src) => {
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => {
            container.innerHTML = '';
            container.appendChild(img);
        };
    };

    const addImage = (fileId) => {
        const container = document.createElement('div');
        container.className = 'image-container';
        container.setAttribute('data-src', `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`);
        container.innerHTML = '<div class="placeholder">Loading...</div>';
        imageList.appendChild(container);
        observer.observe(container);
    };

    const loadMoreImages = (type) => {
        fetch(`https://a7tggd5ycu.apigw.ntruss.com/image/v1/json/fileIds?image_type=${type}&first_row=${first_row}&row_count=${row_count}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log(data['result']);

                if (data['result'].length === 0) {
                    loading.textContent = '끝';
                    return;
                }

                for (const element of data['result']) {
                    addImage(element['fileId']);
                }
                first_row += data['result'].length;
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
                loading.textContent = 'Error loading images';
            });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target, entry.target.getAttribute('data-src'));
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const scrollObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    };

    const scrollObserverCallback = (entries) => {
        if (entries[0].isIntersecting) {
            loadMoreImages(imageType);
        }
    };

    const scrollObserver = new IntersectionObserver(scrollObserverCallback, scrollObserverOptions);
    scrollObserver.observe(loading);

    function imageReset(event) {
        aMenu = event.target;
        googleImageFolder_id = aMenu.getAttribute('data-googleImageFolder_id');
        imageType = googleImageFolder_id;

        const elementsToDelete = document.querySelectorAll('.image-container');
        // 모든 요소를 삭제
        elementsToDelete.forEach(element => {
            element.remove();
        });
        first_row = 1
    }

    const addMenu = (googleImageFolder_id, menuName, googleImageFolderGroup_id) => {
        const menuContainer = document.createElement('a');
        menuContainer.className = 'get-image-menu';
        menuContainer.href = '#';
        menuContainer.textContent = `알림장 ${menuName}`;
        menuContainer.setAttribute('data-googleImageFolder_id', googleImageFolder_id);

        const eunsaeMenu = document.getElementById('eunsae-menu');
        const eunhoMenu = document.getElementById('eunho-menu');

        if (googleImageFolderGroup_id === 1) {
            menu = eunsaeMenu;
        } else if (googleImageFolderGroup_id === 2) {
            menu = eunhoMenu;
        }

        menuContainer.addEventListener('click', function(event) {
            imageReset(event);
        });

        menu.appendChild(menuContainer);
    };

    const loadMenu = (googleImageFolderGroup_id) => {
        fetch(`https://a7tggd5ycu.apigw.ntruss.com/image/v1/json/menus?googleImageFolderGroup_id=${googleImageFolderGroup_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log(data['result']);

                for (const element of data['result']) {
                    addMenu(element['id'], element['name'], googleImageFolderGroup_id);
                }
            })
            .catch(error => {
                console.error('메뉴API 오류');
            });
    };

    loadMenu(1);
    loadMenu(2);

    // loadMoreImages(); // 초기 이미지 로드

});
