# variables
[isDragging, opacityTuple] = [null, null]


# functions
updateOpacity = ->
  # console.log opacityTuple
  $('.link.predefined').css 'opacity', opacityTuple[0]
  $('.link.attributeBased').css 'opacity', opacityTuple[1]
  $('.link.hybrid').css 'opacity', opacityTuple[2]
  return


# initialize ui
init = ->
  console.log 'HP initialized'
  opacityTuple = [.7, .7, .7]
  updateOpacity()

  $('#handle-bottom').mousedown (event) ->
    event.preventDefault()
    event.stopPropagation()
    thisbottom = parseInt $(this).css 'bottom'
    y = event.pageY
    $(document).on('mousemove.dragging', (event) ->
      ry = event.pageY - y
      $('.navbar-fixed-bottom').css 'height', thisbottom - ry
      $('#handle-bottom').css 'bottom', thisbottom - ry
      $('#visCanvas').css 'bottom', thisbottom - ry + 24
      $('#rightPanelTop').css 'bottom', thisbottom - ry + 24
      $('#bottom-left-toolbar').css 'bottom', thisbottom - ry + 24*2
      $('#linkingCriteriaSuggestionContainer').css 'height', thisbottom - ry - 60
      $('#activeQueryContainer').css 'height', thisbottom - ry - 60
      return
    ).on 'mouseup.dragging mouseleave.dragging', (event) ->
      $(document).off '.dragging'
      return
    return

  $('#bottom-left-toolbar > button').tooltip 'placement': 'right', 'trigger': 'hover'

  $('#toggle-opacity').click (event) ->
    $('#opacity-control').toggleClass 'hidden'
    return
  
  slider = new Slider('#ex1', formatter: (value) ->
    'Current opacity: ' + value + '%'
  )
  slider.on 'slide', (sliderValue) ->
    opacityTuple[0] = sliderValue/100
    updateOpacity()
    return

  slider = new Slider('#ex2', formatter: (value) ->
    'Current opacity: ' + value + '%'
  )
  slider.on 'slide', (sliderValue) ->
    opacityTuple[1] = sliderValue/100
    updateOpacity()
    return

  slider = new Slider('#ex3', formatter: (value) ->
    'Current opacity: ' + value + '%'
  )
  slider.on 'slide', (sliderValue) ->
    opacityTuple[2] = sliderValue/100
    updateOpacity()
    return
  
  
  return


# initialization when document gets ready
$ ->
  init()
  return