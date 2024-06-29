document.addEventListener('DOMContentLoaded', function() {
    const imageList = document.getElementById('image-list');
    const loading = document.getElementById('loading');
    // const recentButton = document.getElementById('recentButton');
    const menuButtons = document.querySelectorAll('.dropbtn');
    let imageType = "recent";
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

    // 버튼 클릭 시 실행할 함수 정의
    function handleButtonClick(event) {
        const elementsToDelete = document.querySelectorAll('.image-container');
        // 모든 요소를 삭제
        elementsToDelete.forEach(element => {
            element.remove();
        });
        first_row = 1

        const button = event.currentTarget;
        imageType = button.getAttribute('data-type');
        console.log(imageType)
    }

    // 모든 버튼에 클릭 이벤트 리스너 추가
    menuButtons.forEach(menuButton => {
        menuButton.addEventListener('click', handleButtonClick);
    });

    // loadMoreImages(); // 초기 이미지 로드

});
