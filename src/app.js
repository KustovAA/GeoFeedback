ymaps.ready(function () {
    const map = new ymaps.Map('map', 
        {
            center: [55.751574, 37.573856],
            zoom: 9,
            behaviors: ['default', 'scrollZoom']
        }, 
        {
            searchControlProvider: 'yandex#search'
        }
    );

    const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        `
            <h2 class=ballon_header>{{properties.head }}</h2>
            <div class=ballon_body>{{properties.address}}</div>
            <div class=ballon_footer>{{properties.balloonContentFooter|raw }}</div>
        `
    );

    const clusterer = new ymaps.Clusterer({
        /**
         * Через кластеризатор можно указать только стили кластеров,
         * стили для меток нужно назначать каждой метке отдельно.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
         */
        preset: 'islands#invertedVioletClusterIcons',
        /**
         * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
         */
        groupByCoordinates: false,
        /**
         * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
         */
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false, 
        clusterBalloonContentLayout: 'cluster#balloonCarousel', 
        clusterBalloonItemContentLayout: customItemContentLayout,
    });

    let clusterLength = 0;

    map.geoObjects.add(clusterer);

    map.events.add('click', function (e) {
        ymaps.geocode(e.get('coords'))
            .then(res => {
                return res.geoObjects.get(0).getAddressLine();
            })
            .then(add => {
                clusterLength++;
                const placemark = new ymaps.Placemark(e.get('coords'), {
                    address: add, 
                    head: `метка ${clusterLength}`, 
                    coords: e.get('coords')
                });

                // placemark.properties.set('ss', 'ндрес');
                // console.log(placemark.properties.get('ss'));
                // placemark.properties.set('head', `новая метка ${clusterLength}`);
                // placemark.properties.get('coords')

                placemark.events.add('click', function (e) {
                    const ballon = document.createElement('div');
                    const text = document.createElement('input');
                    const pageX = e.originalEvent.domEvent.originalEvent.pageX;
                    const pageY = e.originalEvent.domEvent.originalEvent.pageY;
                    text.style = `
                        width: 100px;
                        height: 10px;
                    `;
                    ballon.style = `
                        height: 50px;
                        background: black;
                        position: absolute;
                        left: ${pageX - 50}px;
                        top: ${pageY - 25}px;
                    `;
                    ballon.addEventListener('click', e => {
                        if (e.target.nodeName === 'DIV') {
                            e.target.style.display = 'none';
                        }
                    });
                    ballon.appendChild(text);
                    document.body.appendChild(ballon);
                });

                clusterer.add(placemark);
            });
    });
});