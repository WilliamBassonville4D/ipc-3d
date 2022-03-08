const $ipc3d = document.getElementById('ipc-3d')

$ipc3d.on('viewsListChanged', () => {
  generateViewButtons()
})

$ipc3d.on('selectionSetListChanged', () => {
  generateSelSetButtons()
})

// ///////////////////////////////////////////////
// Projects
document.getElementById('newProject').addEventListener('click', () => {
  $ipc3d.newProject()
})

document.getElementById('save').addEventListener('click', event => {
  const json = $ipc3d.saveJson()
  console.log(json)

  if (event.ctrlKey) {
    download('ipc.proj', JSON.stringify(json))
  } else {
    localStorage.setItem('ipc-project', JSON.stringify(json))
  }
})

document.getElementById('load').addEventListener('click', () => {
  const jsonStr = localStorage.getItem('ipc-project')

  if (!jsonStr) {
    console.warn('No project data available')
    return
  }

  $ipc3d.loadJson(JSON.parse(jsonStr)).then(() => {})
})

const urlParams = new URLSearchParams(window.location.search)
if (urlParams.has('proj')) {
  const projUrl = urlParams.get('proj')
  fetch(projUrl)
    .then(response => response.text())
    .then(txt => {
      $ipc3d.loadJson(JSON.parse(txt)).then(() => {})
    })
}

// ///////////////////////////////////////////////
// Undo and Redo

document.getElementById('undo').addEventListener('click', event => {
  console.log('undo')
  $ipc3d.undo()
})
document.getElementById('redo').addEventListener('click', event => {
  console.log('redo')
  $ipc3d.redo()
})

// ///////////////////////////////////////////////
// Assets
document.getElementById('loadBike').addEventListener('click', () => {
  $ipc3d.loadAsset('data/Mountain Bike.zcad')
})
document.getElementById('loadGearbox').addEventListener('click', () => {
  $ipc3d.loadAsset('data/gear_box_final_asm.stp.zcad')
})

function download(file, text) {
  //creating an invisible element
  var element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8, ' + encodeURIComponent(text)
  )
  element.setAttribute('download', file)
  document.body.appendChild(element)
  //onClick property
  element.click()
  document.body.removeChild(element)
}

document.getElementById('frameView').addEventListener('click', () => {
  $ipc3d.frameView()
})

/* SHOW HIDE */
document.getElementById('hideSelection').addEventListener('click', () => {
  $ipc3d.hideSelection()
})
document.getElementById('unHideAll').addEventListener('click', () => {
  $ipc3d.unHideAll()
})
/* Misc */
document
  .getElementById('enable-handle')
  .addEventListener('change', changeEvent => {
    var checked = changeEvent.currentTarget.checked
    $ipc3d.selectionManager.showHandles(checked)
    $ipc3d.selectionManager.updateHandleVisibility()
  })

// ////////////////////////////////////////////////
//  Tabs
const $tab1 = document.querySelector('#tab1')
const $tab2 = document.querySelector('#tab2')
const $tab3 = document.querySelector('#tab3')
const $tab4 = document.querySelector('#tab4')

document.querySelector('#showTab1').addEventListener('click', () => {
  $tab1.style.display = ''
  $tab2.style.display = 'none'
  $tab3.style.display = 'none'
  $tab4.style.display = 'none'
})

document.querySelector('#showTab2').addEventListener('click', () => {
  $tab1.style.display = 'none'
  $tab2.style.display = ''
  $tab3.style.display = 'none'
  $tab4.style.display = 'none'
})

document.querySelector('#showTab3').addEventListener('click', () => {
  $tab1.style.display = 'none'
  $tab2.style.display = 'none'
  $tab3.style.display = ''
  $tab4.style.display = 'none'
})
document.querySelector('#showTab4').addEventListener('click', () => {
  $tab1.style.display = 'none'
  $tab2.style.display = 'none'
  $tab3.style.display = 'none'
  $tab4.style.display = ''
})

// ////////////////////////////////////////////////
//  Tree view
const $treeView = document.querySelector('#treeView')
$treeView.setTreeItem($ipc3d.scene.getRoot())
$treeView.setSelectionManager($ipc3d.selectionManager)

// ////////////////////////////////////////////////
//  Views

document.getElementById('createView').addEventListener('click', () => {
  $ipc3d.createView()
})
document.getElementById('saveViewCamera').addEventListener('click', () => {
  $ipc3d.saveViewCamera()
})
document.getElementById('activateNeutralPose').addEventListener('click', () => {
  $ipc3d.activateNeutralPose()
})

$ipc3d.undoRedoManager.on('changeAdded', () => {
  console.log('changeAdded')
})

$ipc3d.undoRedoManager.on('changeUndone', () => {
  console.log('changeUndone')
})

$ipc3d.undoRedoManager.on('changeRedone', () => {
  console.log('changeRedone')
})

function generateViewButtons() {
  const $viewButtons = document.getElementById('viewButtons')
  $viewButtons.replaceChildren()


  $ipc3d.views.forEach((view, index) => {
    const $viewButton = document.createElement('div')
    $viewButton.className = 'border rounded bg-gray-300 px-2  hover:bg-gray-100'
    $viewButton.style.textAlign = 'center'
    $viewButton.textContent = view.name

    $viewButton.addEventListener('click', (event) => {
      const $activeViewButton = document.querySelector('.active-view')
      event.stopPropagation()
      $ipc3d.activateView(index)

      if ($activeViewButton) {
        $activeViewButton.className = 'border rounded bg-gray-300 px-2  hover:bg-gray-100'
        $activeViewButton.classList.remove('active-view')
      }

      if ($activeViewButton === $viewButton) {
        $ipc3d.deactivateView()
      } else {
        $viewButton.className = 'border rounded text-white bg-blue-300 px-2 border-blue-500'
        $viewButton.classList.add('active-view')
      }
    })

    // ////////////////////////////
    // Options Buttons
    const $optionsWrapper = document.createElement('div')
    $optionsWrapper.style.display = 'block'

    // Rename
    const $RenameViewButton = document.createElement('button')
    $RenameViewButton.className = 'border rounded text-black bg-yellow-200 px-2  hover:bg-yellow-150'

    const renameViewIcon = document.createElement('i')
    renameViewIcon.className = 'fa-solid fa-pen-to-square'
    $RenameViewButton.appendChild(renameViewIcon)

    $RenameViewButton.addEventListener('click', (event) => {
      event.stopPropagation()
      let newName = prompt('Rename View',view.name+'-renamed')
      while ($ipc3d.views.map((view) => view.name).includes(newName)) {
        newName = prompt(`This name already exists ! \n Please enter a new name for the view \'${view.name}\'`,view.name+'-renamed')
      }
      if (newName) $ipc3d.renameView(index, newName)
    })
    $optionsWrapper.appendChild($RenameViewButton)

    // Delete
    // <i class="fa-solid fa-trash-can-xmark"></i>
    const $deleteViewButton = document.createElement('button')
    $deleteViewButton.className = 'border rounded text-black bg-red-200 px-2  hover:bg-red-150'

    const deleteViewIcon = document.createElement('i')
    deleteViewIcon.className = 'fa-solid fa-trash'
    $deleteViewButton.appendChild(deleteViewIcon)

    $deleteViewButton.addEventListener('click', (event) => {
      event.stopPropagation()
      $ipc3d.deleteView(index)
    })
    $optionsWrapper.appendChild($deleteViewButton)

    $viewButton.appendChild($optionsWrapper)
    $viewButtons.appendChild($viewButton)
  })
}

// ////////////////////////////////////////////////////
// Selection Sets

document.getElementById('createSelectionSet').addEventListener('click', () => {
  $ipc3d.createSelectionSet()
})
function generateSelSetButtons() {
  const $selectionSetButtons = document.getElementById('selectionSetButtons')
  $selectionSetButtons.replaceChildren()

  $ipc3d.selectionSets.forEach((selectionSet, index) => {
    const $selectionSetButton = document.createElement('div')
    $selectionSetButton.className = 'border rounded bg-gray-300 px-2  hover:bg-gray-100'
      $selectionSetButton.style.textAlign = 'center'
      $selectionSetButton.textContent = selectionSet.name

      $selectionSetButton.addEventListener('click', (event) => {
        event.stopPropagation()
        $ipc3d.activateSelectionSet(index)

        const $activeSelectionSetButton = document.querySelector('.active-selection-set')
        if ($activeSelectionSetButton) {
          $activeSelectionSetButton.className = 'border rounded bg-gray-300 px-2  hover:bg-gray-100'
          $activeSelectionSetButton.classList.remove('active-selection-set')
        }

        if ($activeSelectionSetButton === $selectionSetButton) {
          $ipc3d.deactivateSelectionSet()
        } else {
          $selectionSetButton.className = 'border rounded text-white bg-blue-300 px-2 border-blue-500'
          $selectionSetButton.classList.add('active-selection-set')
        }
      })

      // ////////////////////////////
      // Options Buttons
      const $optionsWrapper = document.createElement('div')
      $optionsWrapper.style.display = 'block'

      // Rename
      const $renameBtn = document.createElement('button')
      $renameBtn.className = 'border rounded text-black bg-yellow-200 px-2  hover:bg-yellow-150'

      const iconElement = document.createElement('i')
      iconElement.className = 'fa-solid fa-pen-to-square'
      $renameBtn.appendChild(iconElement)

      $renameBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        let newName = prompt('Rename SelectionSet',selectionSet.name+'-renamed')
        while ($ipc3d.selectionSets.map((selectionSet) => selectionSet.name).includes(newName)) {
          newName = prompt(`This name already exists ! \n Please enter a new name for the selectionSet \'${selectionSet.name}\'`,selectionSet.name+'-renamed')
        }
        if (newName) $ipc3d.renameSelectionSet(index, newName)
      })
      $optionsWrapper.appendChild($renameBtn)

      // Delete
      const $deleteBtn = document.createElement('button')
      $deleteBtn.textContent = 'Delete'
      $deleteBtn.className = 'border rounded text-black bg-red-200 px-2  hover:bg-red-150'
      $deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation()
        $ipc3d.deleteSelectionSet(index)
      })
      $optionsWrapper.appendChild($deleteBtn)

      $selectionSetButton.appendChild($optionsWrapper)
      $selectionSetButtons.appendChild($selectionSetButton)
    })
}

// ////////////////////////////////////////////////////
// Cut Planes

document.getElementById('createCuttingPlane').addEventListener('click', () => {
  $ipc3d.addCuttingPlane()
  generateCuttingPlanes()
})
function generateCuttingPlanes() {
  const $cuttingPlaneButtons = document.getElementById('cuttingPlaneButtons')
  $cuttingPlaneButtons.replaceChildren()

  let $highlightedSelectionSetBtn
  $ipc3d.cuttingPlanes.forEach((cuttingPlane, index) => {
    const $button = document.createElement('button')
    $button.className = 'border rounded bg-gray-300 px-2  hover:bg-gray-100'
    $button.textContent = cuttingPlane.name

    $button.addEventListener('click', () => {
      $ipc3d.activateCuttingPlane(index)
      if ($highlightedSelectionSetBtn)
        $highlightedSelectionSetBtn.style.borderColor = ''
      $button.style.borderColor = 'red'
      $highlightedSelectionSetBtn = $button
    })

    $cuttingPlaneButtons.appendChild($button)
  })
}
