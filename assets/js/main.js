'strict mode'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const player = $('.player')
const cd = $('.cd')
const singer = $('header h4')
const header = $('header h2')
const cd_thumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const progressPlay = $('#progress')
const volumeProgress = $('#volume')
const repeatBtn = $('.btn-repeat')
const randomBtn = $('.btn-random')
const playList = $('#playlist')
const current_time = $('#current-time')
const total_duration = $('#total-duration')
const maxVolume = $('.max-volume')
const minVolume = $('.min-volume')
const quantityRepeat = $('#quantity-repeat')
const song_active = '.song.active'
const repeats = [0, 1, 2]
const songs = [
    {
        id: 1,
        name: 'Faded',
        singer: 'Dương Mịch',
        path: 'assets/music/Faded.mp3',
        image: 'assets/img/duong-mich.jpg'
    },
    {
        id: 2,
        name: 'FallingDown',
        singer: 'Triệu Lệ Dĩnh',
        path: 'assets/music/fallingdown.mp3',
        image: 'assets/img/trieu-le-dinh.jpg'
    },
    {
        id: 3,
        name: 'Rather Be',
        singer: 'Địch Lệ Nhiệt Ba',
        path: 'assets/music/Rather Be.mp3',
        image: 'assets/img/dich-le-nhiet-ba.jpg'
    },
    {
        id: 4,
        name: 'Dtay',
        singer: 'Triệu Lộ Tư',
        path: 'assets/music/stay.mp3',
        image: 'assets/img/trieu-lo-tu.jpg'
    },
    {
        id: 5,
        name: 'Ava Max  Salt Lyric',
        singer: 'Bạch Lộc',
        path: 'assets/music/Ava Max  Salt Lyrics.mp3',
        image: 'assets/img/bach-loc.jpg'
    },
    {
        id: 6,
        name: 'Xuất Sơn',
        singer: 'Thu Ngư Hân',
        path: 'assets/music/xuat_son.mp3',
        image: 'assets/img/ngu-thu-han.jpg'
    },
    {
        id: 7,
        name: 'Cz12 Soundtrack',
        singer: 'Lưu Diệp Phi',
        path: 'assets/music/Cz12 Soundtrack - Unstoppable_UdfzqtaBX84.mp3',
        image: 'assets/img/luu-diec-phi.jpg'
    },
    {
        id: 8,
        name: 'I Like You So Much',
        singer: 'Dương Tử',
        path: 'assets/music/i_like_you_so_much.mp3',
        image: 'assets/img/duong-tu.jpg'
    },
    {
        id: 9,
        name: 'Take Me Hand',
        singer: 'Viên Băng Nghiên',
        path: 'assets/music/take_me_hand.mp3',
        image: 'assets/img/vien-bang-nghien.jpg'
    },
    {
        id: 10,
        name: 'Let Me Down Slowly',
        singer: 'Tịnh Cúc Y',
        path: 'assets/music/let_me_down_slowly.mp3',
        image: 'assets/img/cuc-tinh-y.jpg'
    }
]


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentRepeat: 0,
    isMuted: false,
    currentVolume: 0.5,
    // config in case f5
    config: JSON.parse(localStorage.getItem('setting-music')) || {},

    orderSongs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem('setting-music', JSON.stringify(this.config))
    },
    render: function () {
        const listHtml = songs.map((song, index) =>
            `
                <div class="song" data-index='${index}'>
                    <div class="thumb" style="background-image: url(${song.image})"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
             `
        )
        playList.innerHTML = listHtml.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        // handle scroll
        document.onscroll = function () {
            // có nhiều browser không hỗ trọw
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollTop
            // apply to element
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }

        // handle play song when click
        playBtn.onclick = function () {
            // lần đâu khi chưa lick thì isPlaying=undefined==>false
            _this.isPlaying ? audio.pause() : audio.play()
            _this.isPlaying = !_this.isPlaying
        }
        //xử lý audio
        // xử lý khi đang chạy
        audio.onplay = function () {
            player.classList.add('playing')
            if (!cd_thumb.classList.contains('rotate')) {
                cd_thumb.classList.add('rotate')
            }
            cd_thumb.style.animationPlayState = 'running'
        }
        // xử lý khi đã dừng
        audio.onpause = function () {
            player.classList.remove('playing')
            cd_thumb.style.animationPlayState = 'paused'
        }

        // xử lý seek khi đang chạy
        audio.ontimeupdate = function () {
            if (audio.duration) {
                // show current time
                current_time.innerText = _this.formatTime(audio.currentTime)
                progressPlay.value = (audio.currentTime / audio.duration) * 100
            }
        };
        // timePassed = 0
        // const timerId = setInterval(() => {
        //     timePassed += 1
        //     progressPlay.value = Math.floor((timePassed / audio.duration) * 100)

        // }, 1000);


        // xử lý kéo seek
        progressPlay.addEventListener("input", () => {
            const currentTime = (audio.duration / progressPlay.max) * progressPlay.value
            current_time.innerText = _this.formatTime(currentTime)
            audio.currentTime = currentTime
        });

        // xử lý âm lượng
        volumeProgress.addEventListener("input", () => {//on change when drag and drop
            _this.currentVolume = (volumeProgress.value / volumeProgress.max)
            this.isMuted = !_this.currentVolume
            this.loadVolumeAndIcon()
            _this.setConfig('volume', _this.currentVolume)
            _this.setConfig('isMuted', _this.isMuted)
        })

        minVolume.onclick = function () {
            _this.isMuted = true
            _this.currentVolume = 0
            volumeProgress.value = 0
            _this.loadVolumeAndIcon()
            _this.setConfig('isMuted', _this.isMuted)
            _this.setConfig('volume', _this.currentVolume)
        }

        maxVolume.onclick = function () {
            _this.isMuted = !_this.isMuted
            if (_this.currentVolume === 0 && !_this.isMuted) {
                _this.currentVolume = 0.1
                volumeProgress.value = _this.currentVolume * volumeProgress.max
            }
            else {
                audio.volume = _this.isMuted ? 0 : _this.currentVolume
            }
            _this.loadVolumeAndIcon()
            _this.setConfig('isMuted', _this.isMuted)
        }

        // xử lý next  bài
        nextBtn.onclick = function () {
            _this.changeSong()
        }
        // xử lý prev bài
        prevBtn.onclick = function () {
            _this.changeSong('prev')
        }
        // xử lý random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom)
            _this.setConfig('isRandom', _this.isRandom)
        }
        // repeat song
        repeatBtn.onclick = function () {
            _this.currentRepeat = (++_this.currentRepeat > repeats.length - 1) ? 0 : _this.currentRepeat++
            quantityRepeat.innerText = _this.currentRepeat === 1 ? _this.currentRepeat : ''
            repeatBtn.classList.toggle('active', repeats[_this.currentRepeat])
            _this.setConfig('currentRepeat', _this.currentRepeat)
        }

        // xử lý khi audio ended
        audio.onended = function () {
            if (repeats[_this.currentRepeat] == 1) {
                audio.play()
            } else {
                _this.setNewSong('next')
                cd_thumb.classList.remove('rotate')
                _this.scrollToActiveSong()
                if (_this.currentIndex == 0 && repeats[_this.currentRepeat] == 0) {
                    audio.pause()
                    _this.isPlaying = false
                } else {
                    audio.play()
                }
            }
        }

        // xử lý click into song to play
        // có thể lắng nghe event ngay sau khi render
        playList.onclick = function (e) {
            const songElement = e.target.closest('.song:not(.active)')
            const optionElement = e.target.closest('.option')
            if (songElement) {
                _this.currentIndex = +songElement.dataset.index
                cd_thumb.classList.remove('rotate')
                _this.loadCurrentSong()
                if (_this.isPlaying) {
                    audio.play()
                }
            } else if (optionElement) {
                // khi click option
                console.log(el);
            }
        }


        window.addEventListener("keypress", (event) => {
            if (event.keyCode === 32) {
                playBtn.onclick()
                _this.scrollToActiveSong()
            }
        }, false);
    },
    // volume change => affect audio.volume and icon volume
    loadVolumeAndIcon: function () {
        // update volume
        audio.volume = this.isMuted ? 0 : +this.currentVolume
        // load icon
        //-volume=0=>false
        if (this.isMuted || !this.currentVolume) {
            maxVolume.classList.remove('fa-volume-up')
            maxVolume.classList.add('fa-volume-mute')
        } else {
            maxVolume.classList.add('fa-volume-up')
            maxVolume.classList.remove('fa-volume-mute')
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            if ($(song_active)) {
                $(song_active).scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                })
            }
        }, 200)
    },
    loadConfig: function () {
        this.currentIndex = !this.config.currentIndex ? this.currentIndex : this.config.currentIndex
        this.currentRepeat = !this.config.currentRepeat ? this.currentRepeat : this.config.currentRepeat
        this.currentVolume = !this.config.volume ? this.currentVolume : this.config.volume
        this.isRandom = this.config.isRandom
        this.isMuted = this.config.isMuted
    },
    loadActiveSong: function () {
        if ($(song_active)) {
            $(song_active).classList.remove('active')
        }
        $('[data-index="' + this.currentIndex + '"]').classList.add('active')
    },
    loadCurrentSong: function () {
        // load info song
        singer.innerText = this.currentSong.singer
        header.innerText = this.currentSong.name
        cd_thumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path

        current_time.innerText = '00:00'
        progressPlay.value = 0
        audio.onloadedmetadata = function () {
            total_duration.innerText = app.formatTime(audio.duration)
        };
        // load active song
        this.loadActiveSong()
        this.setConfig('currentIndex', this.currentIndex)
    },
    loadControlSong: function () {
        randomBtn.classList.toggle('active', Boolean(this.isRandom))
        repeatBtn.classList.toggle('active', Boolean(repeats[this.currentRepeat]))
        volumeProgress.value = this.currentVolume * volumeProgress.max
        this.loadVolumeAndIcon()
        audio.volume = this.isMuted ? 0 : this.currentVolume
        quantityRepeat.innerText = this.currentRepeat === 1 ? this.currentRepeat : ''

    },
    setNewSong: function (type) {
        if (type === 'next' || type === 'prev') {
            let newEl
            if (type === 'next') {
                newEl = $(song_active).nextElementSibling;
                this.currentIndex = !newEl ? playlist.firstElementChild.dataset.index : newEl.dataset.index
            } else {
                newEl = $(song_active).previousElementSibling;
                this.currentIndex = !newEl ? playlist.lastElementChild.dataset.index : newEl.dataset.index
            }
            this.loadCurrentSong()
        }
    },
    playRandomSong: function () {
        do {
            var newIndex = Math.floor(Math.random() * songs.length)
        } while (this.currentIndex === newIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    changeSong: function (type = 'next') {
        if (type === 'next' || type === 'prev') {
            if (this.isRandom) {
                this.playRandomSong()
            }
            else {
                type === 'next' ? this.setNewSong('next') : this.setNewSong('prev')
            }
            if (this.isPlaying) {
                audio.play()
            }
            cd_thumb.classList.remove('rotate')
            this.scrollToActiveSong()
        }
    },
    formatTime: function (totalSeconds) {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds - minutes * 60);
        if (seconds < 10) { seconds = "0" + seconds; }
        if (minutes < 10) { minutes = "0" + minutes; }
        return minutes + ':' + seconds
    },
    dragAndDrop: function () {
        let items = document.getElementsByClassName('song'), current = null;
        for (let song of items) {
            // cho phép element được kéo, link and image default=true
            song.draggable = true;
            // Execute a JavaScript when the user starts to drag a element:
            song.ondragstart = (ev) => {
                current = song;
                for (let it of items) {
                    if (it != current) { it.classList.add("hint"); }
                }
            };
            function getParentElement(element, selector) {
                while (element.parentElement) {
                    if (element.parentElement.matches(selector)) {
                        return element.parentElement
                    }
                    element = element.parentElement
                }
            }
            // Execute a JavaScript when a draggable element enters a drop target
            song.ondragenter = (ev) => {
                if (song != current) { song.classList.add("activeDrop") }
            };

            // Execute js when a draggable el moved out of a drop target
            song.ondragleave = (ev) => {
                const parentElement = getParentElement(ev.target, '.song')
                const currentElement = ev.target.classList.contains('song')
                if ((!parentElement)) {
                    song.classList.remove("activeDrop");
                }
            };

            // Execute a JavaScript when the user has finished dragging a element:
            song.ondragend = () => {
                for (let it of items) {
                    it.classList.remove("hint");
                    it.classList.remove("activeDrop");
                }
            };

            // Execute a JavaScript when an element is being dragged over a drop target:
            song.ondragover = (evt) => {
                evt.preventDefault();
            };

            // Execute a JavaScript when a draggable element is dropped in a element: (vung dropzone)
            song.ondrop = (evt) => {
                evt.preventDefault();
                if (song != current) {
                    let currentPos = 0, droppedPos = 0;
                    for (let it = 0; it < items.length; it++) {
                        if (current == items[it]) { currentPos = it; }
                        if (song == items[it]) { droppedPos = it; }
                    }
                    if (currentPos < droppedPos) {
                        song.parentNode.insertBefore(current, song.nextSibling);
                    } else {
                        song.parentNode.insertBefore(current, song);
                    }
                }
            };

        }
    },
    start: function () {
        // load config from localStorage
        this.loadConfig()
        // define properties
        this.defineProperties()
        // render UI
        this.render()
        // call events
        this.handleEvents()
        // load control song
        this.loadControlSong()
        // load current song into UI
        this.loadCurrentSong()
        this.dragAndDrop()
    }
}
app.start()

