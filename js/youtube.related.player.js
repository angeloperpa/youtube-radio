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

var id;

function search() {
	var q = $('#query').val();
	var request = gapi.client.youtube.search.list({
		q: q,
		part: 'snippet',
		maxResults: 1,
	});

	request.execute(function(response){
		var resultItems = response.result.items;
		$.each(resultItems, function(index, item) {
			title = item.snippet.title;
			$('#title').html(title);

			id = item.id.videoId;
			
			thumbnail = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
			$('#thumbnail').css('background-image','url("' + thumbnail + '")');
			playerCreator(id);
		})
	});
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
		nextVideo(id);
	}
	if(player.getPlayerState() == -1) {
		nextVideo(id);
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
	nextVideo(id);
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
function nextVideo(id_next) {
	var request = gapi.client.youtube.search.list({
		part: 'snippet',
		relatedToVideoId: id_next,
		maxResults: 1,
		type: 'video'
	});
	request.execute(function(response){
		var resultItems = response.result.items;
		$.each(resultItems, function(index, item) {
			title = item.snippet.title;
			$('#title').html(title);

			id = item.id.videoId;
			$('#playPause-icon').removeClass('glyphicon-pause');
			$('#playPause-icon').addClass('glyphicon-play');	
			
			thumbnail = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
			$('#thumbnail').css('background-image','url("' + thumbnail + '")');
			playerCreator(id);
		})
	});
}