'use strict'
function switchToGameMenu(){
	isGamePaused = false;
	hideAllMenus();
	$('canvas').css('display', 'block');
	$('nav').css('display', 'block');
}
function switchToSettings(){
	hideAllMenus();
	$('#settingsMenu').css('display', 'block');
	$('#settingSave').click(function(){
		$('.settingInput').each(function(){
			let name = $(this).attr('id');
			let value = $(this).attr('value');
			window[name] = value;
		});
	});
}
function switchToInventory(){
	hideAllMenus();
	$('#inventoryMenu').css('display', 'block');
}
function switchToLoad(){
	hideAllMenus();
	$('#loadMenu').css('display', 'block');
	buildLoadMenu();
}
function hideAllMenus(){
	$('#inventoryMenu').css('display', 'none');
	$('#mainMenu').css('display', 'none');
	$('#settingsMenu').css('display', 'none');
	$('canvas').css('display', 'none');
	$('nav').css('display', 'none');
	$('#renderCanvas').css('display', 'none');
	$('#loadMenu').css('display', 'none');
}