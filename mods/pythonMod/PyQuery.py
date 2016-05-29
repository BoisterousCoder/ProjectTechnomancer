from inspect import isfunction
from json import dumps
from json import loads
import os
import sys
#-----------------------------------------------------
#			access using PQ or PyQuery
#If you want to add or remove commands/requests go further down
#-----------------------------------------------------

def rreplace(s, old, new, occurrence):
	li = s.rsplit(old, occurrence)
	return new.join(li)

def makePyQuery():
	def command(name, params = {}):
		msg = dumps(params, separators=(',',':'))
		print('<*>%s<*>%s' % (name, msg))

	def request(name, params = {}):
		msg = dumps(params, separators=(',',':'))
		res = input('<:>%s<:>%s' % (name, msg))
		if(res[0:3]=='<:>'):
			res = res.split('<:>')
			return res[2]

	def startListener():
		command('loaded')
		while True:
			data = None;
			if sys.version_info >= (3, 0):
				data = input()
			else:
				data = raw_input()

			data = repr(data)
			data = data.replace("'",'', 1)
			data = rreplace(data, "'",'', 1)
			if(data[0:3]=='<*>'):
				data = data.split('<*>')
				answerCall(data[1], data[2]);
			else:
				print(data)

	def answerCall(name, data):
		isNameInArray = False
		for callback in callbackList:
			if (callback.get_name() == name):
				callback.run(data)
				isNameInArray=True
				break
		if not isNameInArray:
			command('warn', {'msg':'The %s callback was not found.' % name})

	callbackList = []

	class Callback():
		__name = None
		__function = None
		__selector = None
		__mode = None

		def __init__(self, selector, mode, run=None):
			self.__name = selector + ":" + mode
			self.__selector = selector
			self.__mode = mode
			self.__function = run
			callbackList.append(self)
			if(not isfunction(run)):
				command('warn', {'msg':"The %s callback's function property was not set to a function." % name})

		def run(self, this):
			this = loads(this)
			self.__function(this)

		def set_function(self, function):
			self.__function = function

		def get_name(self):
			return self.__name

		def get_mode(self):
			return self.__mode

		def get_selector(self):
			return self.__selector

	class PyQuery():
		__selector=None
		__index=None
		__callback={}

		def __init__(self, x, y, layer, game):
			self.__x = x
			self.__y = y
			self.__layer = layer;
			self.__selector = str(x*y);
			self.__callback = {}
			if self.__layer is 'ent':
				print('--')
			self.__index = request("index", {'selector':selector, 'i':self.__x})

		def get_selector(self):
			return self.__selector
#--------------------------------------------------------------
#this next section is where you can add more commands/requests
#--------------------------------------------------------------
		def makeCallback(self, mode, runFunc):
			hasMadeCallback = False
			try:
				self.__callback[mode]
				#self.__callback[mode].set_function(runFunc)
			except KeyError:
				self.__callback[mode] = Callback(self.__selector, mode, runFunc)
				hasMadeCallback = True
			if not hasMadeCallback:
				command('warn', {'msg':"The %s's %s callback's function property was already set to a function and can not be set again." % (self.__selector, mode)})

			command('callback', {
					'selector':self.__callback[mode].get_selector(),
					'type':self.__callback[mode].get_mode(),
					'name':self.__callback[mode].get_name(),
					'index':str(self.__index)
				});
			return self
		def append(self, text):
			command('append', {
					'selector':self.__selector,
					'text':text,
					'index':str(self.__index)
				})
			return self
		def css(self, data):
			if(isinstance(data, dict)):
				command('css', {
					'selector':self.__selector,
					'rules':data,
					'index':self.__index
				})
				return self
			else:
				return request('css', {
					'selector':self.__selector,
					'property':data,
					'index':self.__index
				})
		def attr(self, attribute, value=None):
			if value is not None:
				command('attribute', {
						'selector':self.__selector,
						'property':attribute,
						'value':value,
						'index':self.__index
					})
				return self
			else:
				return request('attribute', {
						'selector':self.__selector,
						'property':attribute,
						'index':self.__index
					})
		def html(self, text=None):
			if text is not None:
				command('html', {
						'selector':self.__selector,
						'text':text,
						'index':self.__index
					})
				return self
			else:
				return request('html', {
						'selector':self.__selector,
						'index':self.__index
					})
		def value(self, value=None):
			if value is not None:
				command('value', {
						'selector':self.__selector,
						'value':value,
						'index':self.__index
					})
				return self
			else:
				return request('value', {
						'selector':self.__selector,
						'index':self.__index
					})
		def size(self):
			return request('size', {
					'selector':self.__selector,
					'index':self.__index
				})
		def toggleClass(self, data):
			command('toggleClass', {
					'selector':self.__selector,
					'index':self.__index,
					'class': data
				})
	def makeLoop(runFunc):
			hasMadeCallback = False
			mode = 'loop';
			selector = 'Main';
			callback = Callback(selector, mode, runFunc);

			command('loop', {
					'selector':selector,
					'type':mode,
					'name':selector + ":" + mode
				});
	PyQuery.makeLoop = makeLoop;
	PyQuery.start = startListener;
	PyQuery.command = command;
	PyQuery.request = request;
	
	return PyQuery

PyQuery = makePyQuery()
PQ = PyQuery
	