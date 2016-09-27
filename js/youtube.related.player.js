function googleApiClientReady() {
    var apiKey = 'AIzaSyCb25DduIQJLUhY2usPTzRZFbVK1KTRBn0';

    gapi.client.setApiKey(apiKey);
    gapi.client.load('youtube', 'v3', function() {
        isLoad = true;
    });

    handleAPILoaded(); 
}
function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
}

var videos = [];
var current = 0;

function video(title, id, thumbnail) {
	this.title = title;
	this.id = id;
	this.thumbnail = thumbnail;
}

function search() {
	clearList();
	current = 0;
	var q = $('#query').val();
	var request = gapi.client.youtube.search.list({
		q: q,
		part: 'snippet',
		maxResults: 1,
	});
	request.execute(function(response){
		var resultItems = response.result.items;
		$.each(resultItems, function(index, item) {
			var title = item.snippet.title;
			var id = item.id.videoId;
			var thumbnail = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
			var vid = new video(title, id, thumbnail);
			videos.push(vid);
			createList(id);
			playerCreator();
		})
	});	
}
function createList(id_list) {
	var request = gapi.client.youtube.search.list({
		part: 'snippet',
		relatedToVideoId: id_list,
		maxResults: 20,
		type: 'video'
	});
	request.execute(function(response){
		var resultItems = response.result.items;
		$.each(resultItems, function(index, item) {
			var title = item.snippet.title;
			var id = item.id.videoId;
			var thumbnail = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
			var vid = new video(title, id, thumbnail);
			videos.push(vid);
		})
	});
}
function clearList() {
	var videos_val = videos.length
	for(var i = 0; i < videos_val; i++) {
		videos.pop();
	}
}
function nextVideo() {
	current++;
	if((videos.length - 1) == current) {
		console.log(current);
		var id = videos[current].id;
		playerCreator();
		clearList();
		createList(id);
		current = -1;
	}
	else {
		playerCreator();
	}
}
$('#search-button').click(function() {
	search();
});
$('#query').keypress(function(e) {
	if(e.which == 13) {
		search();
	}
});

var player;

function playerCreator(id) {
	$('#player-placeholder').remove();
	$('body').append($('<section/>', {
		id: 'player-placeholder'
	}));

	var title = videos[current].title;	
	var thumbnail = videos[current].thumbnail;
	var id = videos[current].id;

	$('#title').html(title);			
	$('#thumbnail').css('background-image','url("' + thumbnail + '")');
	player = new YT.Player('player-placeholder', {
		videoId: id,
		width: 0,
		height: 0,
		events: {
			onReady: initialize
		}
	});
}
function initialize() {
	player.playVideo();
	$('#playPause-icon').removeClass('glyphicon-play');
	$('#playPause-icon').addClass('glyphicon-pause');
	updateProgressBar();
	updateTimerDisplay();

	time_update_interval = setInterval(function() {
		updateProgressBar();
		updateTimerDisplay();
	}, 1000)
}
$('#progress').on('mouseup touchend', function (e) {

    var newTime = player.getDuration() * (e.target.value / 100);
    player.seekTo(newTime);

});
function updateProgressBar() {
	$('#progress').val((player.getCurrentTime() / player.getDuration()) * 100);
}
function updateTimerDisplay() {
	$('#current-time').text(formatTime(player.getCurrentTime()));
	$('#duration').text(formatTime(player.getDuration()));
	if(player.getDuration() == player.getCurrentTime()) {
		nextVideo();
	}
	if(player.getPlayerState() == -1) {
		nextVideo();
	}
}
function formatTime(time) {
	time = Math.round(time);

	var minutes = Math.floor(time / 60);
	seconds = time - minutes * 60;

	seconds = seconds < 10 ? '0' + seconds : seconds;

	return minutes + ':' + seconds;
}
$('#playPause').click(function() {
	if(player.getPlayerState() == 1) {
		player.pauseVideo();
		$('#playPause-icon').removeClass('glyphicon-pause');
		$('#playPause-icon').addClass('glyphicon-play');
	}
	else {
		player.playVideo();
		$('#playPause-icon').removeClass('glyphicon-play');
		$('#playPause-icon').addClass('glyphicon-pause');
	}
});
$('#nextVideo').click(function() {
	nextVideo();
});
$('#volume').on('change', function() {
	player.setVolume($(this).val());
});
$('#mute').click(function() {
	if(player.isMuted()) {
		player.unMute();
		$('#mute-icon').removeClass('glyphicon-volume-off');
		$('#mute-icon').addClass('glyphicon-volume-up');
	}
	else {
		player.mute();
		$('#mute-icon').removeClass('glyphicon-volume-up');
		$('#mute-icon').addClass('glyphicon-volume-off');
	}
});