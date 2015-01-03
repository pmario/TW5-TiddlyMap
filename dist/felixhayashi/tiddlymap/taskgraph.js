/*\

title: $:/plugins/felixhayashi/tiddlymap/tiddlymap.js
type: application/javascript
module-type: widget

@preserve

\*/
(function(){"use strict";var e=require("$:/core/modules/widgets/widget.js").widget;var t=require("$:/plugins/felixhayashi/tiddlymap/view_abstraction.js").ViewAbstraction;var i=require("$:/plugins/felixhayashi/tiddlymap/callback_registry.js").CallbackRegistry;var r=require("$:/plugins/felixhayashi/tiddlymap/dialog_manager.js").DialogManager;var s=require("$:/plugins/felixhayashi/tiddlymap/utils.js").utils;var a=require("$:/plugins/felixhayashi/vis/vis.js");var o=function(e,t){this.initialise(e,t);this.adapter=$tw.tiddlymap.adapter;this.opt=$tw.tiddlymap.opt;this.callbackRegistry=new i;this.dialogManager=new r(this,this.callbackRegistry);this.computeAttributes();this.editorMode=this.getAttribute("editor");if(this.editorMode){this.addEventListeners([{type:"tm-create-view",handler:this.handleCreateView},{type:"tm-rename-view",handler:this.handleRenameView},{type:"tm-delete-view",handler:this.handleDeleteView},{type:"tm-edit-view",handler:this.handleEditView},{type:"tm-store-position",handler:this.handleStorePositions},{type:"tm-edit-node-filter",handler:this.handleEditNodeFilter},{type:"tm-import-tiddlers",handler:this.handleImportTiddlers}])}};o.prototype=new e;o.prototype.handleConnectionEvent=function(e,t){var i=this.getView().getAllEdgesFilterExpr(true);var r={edgeFilterExpr:i,fromLabel:this.adapter.selectNodeById(e.from).label,toLabel:this.adapter.selectNodeById(e.to).label};this.dialogManager.open("getEdgeType",r,function(i,r){if(i){var a=s.getText(r);e.label=a&&a!==this.opt.misc.unknownEdgeLabel?a:this.opt.misc.unknownEdgeLabel;this.adapter.insertEdge(e,this.getView())}if(typeof t=="function"){t(i)}});this.preventNextRepaint=true};o.prototype.openStandardConfirmDialog=function(e,t){var i={message:t,dialog:{confirmButtonLabel:"Yes, proceed",cancelButtonLabel:"Cancel"}};this.dialogManager.open("getConfirmation",i,e)};o.prototype.logger=function(e,t){var i=Array.prototype.slice.call(arguments,1);i.unshift("@"+this.objectId.toUpperCase());i.unshift(e);$tw.tiddlymap.logger.apply(this,i)};o.prototype.render=function(e,t){this.registerParentDomNode(e);this.objectId=this.getAttribute("object-id")?this.getAttribute("object-id"):s.genUUID();this.viewHolderRef=this.getViewHolderRef();this.view=this.getView();this.handleSpecialViews();this.initAndRenderEditorBar(e);this.initAndRenderGraph(e);$tw.tiddlymap.registry.push(this)};o.prototype.registerParentDomNode=function(e){this.parentDomNode=e;if(!$tw.utils.hasClass(e,"tiddlymap")){$tw.utils.addClass(e,"tiddlymap");if(this.getAttribute("click-to-use")!=="false"){$tw.utils.addClass(e,"click-to-use")}if(this.getAttribute("class")){$tw.utils.addClass(e,this.getAttribute("class"))}}};o.prototype.handleSpecialViews=function(){if(this.view.getLabel()==="quick_connect"){var e="$:/temp/felixhayashi/tiddlymap/quick_connect_search";this.wiki.setText(e,"text",null,"");var t="[search{"+e+"}!is[system]limit[10]]"+"[field:title["+this.getVariable("currentTiddler")+"]]";this.view.setNodeFilter(t)}};o.prototype.initAndRenderEditorBar=function(e){if(this.editorMode==="advanced"){this.graphBarDomNode=document.createElement("div");$tw.utils.addClass(this.graphBarDomNode,"filterbar");e.appendChild(this.graphBarDomNode);this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode)}};o.prototype.rebuildEditorBar=function(){if(this.editorMode==="advanced"){this.setVariable("var.viewLabel",this.getView().getLabel());this.setVariable("var.isViewBound",String(this.isViewBound()));this.setVariable("var.ref.view",this.getView().getRoot());this.setVariable("var.ref.viewHolder",this.getViewHolderRef());this.setVariable("var.ref.edgeFilter",this.getView().getPaths().edgeFilter);this.setVariable("var.edgeFilterExpr",this.view.getAllEdgesFilterExpr());var e={type:"tiddler",attributes:{tiddler:{type:"string",value:this.getView().getRoot()}},children:[{type:"transclude",attributes:{tiddler:{type:"string",value:this.opt.ref.graphBar}}}]};this.makeChildWidgets([e])}};o.prototype.refresh=function(e){this.callbackRegistry.handleChanges(e);var t=this.isViewSwitched(e);var i=this.getView().refresh(e);if(t){this.logger("warn","View switched");this.view=this.getView(true);this.rebuildGraph(this.getGraphOptions())}else if(i.length){this.logger("warn","View modified",i);this.rebuildGraph(this.getGraphOptions())}else{this.checkOnGraph(e)}if(this.editorMode){this.checkOnEditorBar(e,t,i)}};o.prototype.rebuildGraph=function(e){this.logger("debug","Rebuilding graph");this.hasNetworkStabilized=false;this.graphData=this.getGraphData(true);this.network.setData({nodes:this.graphData.nodes,edges:this.graphData.edges,options:e},this.preventNextRepaint);this.preventNextRepaint=false};o.prototype.hasStartedDiving=function(){return this.lastNodeDoubleClicked&&this.getView().isConfEnabled("node_diving")};o.prototype.getContainer=function(){return this.parentDomNode};o.prototype.getGraphData=function(e){if(!e&&this.graphData){return this.graphData}if(this.hasStartedDiving()){var t=s.getEmptyMap();this.lastNodeDoubleClicked.group="special";t[this.lastNodeDoubleClicked.id]=this.lastNodeDoubleClicked}else{var i=this.getView().getNodeFilter("compiled");var t=this.adapter.selectNodesByFilter(i,{view:this.getView(),outputType:"hashmap"})}if(this.getView().getLabel()==="quick_connect"){var r=this.adapter.selectNodesByReference([this.getVariable("currentTiddler")],{outputType:"hashmap",addProperties:{group:"special",x:1,y:1}});s.inject(r,t)}var a=this.adapter.selectEdgesByEndpoints(t,{view:this.getView(),endpointsInSet:">=1"});if(this.getView().isConfEnabled("display_neighbours")||this.hasStartedDiving()){var o=this.adapter.selectNeighbours(t,{edges:a,outputType:"hashmap",view:this.getView(),addProperties:{group:"neighbours"}});s.inject(o,t)}if(this.getView().getConfig("layout.active")==="hierarchical"){var n=s.getPropertiesByPrefix(this.getView().getConfig(),"config.layout.hierarchical.order-by-",true);console.log("ids",n);var d=s.getEmptyMap();for(var h in n){var l=s.getTiddlerById(h);if(l){d[s.getBasename(l.fields.title)]=true}}console.log("labels",d);this.setHierarchy(t,a,function(e){return d[e.label]})}var g={edges:a,nodes:s.convert(t,"dataset"),nodesByRef:s.getLookupTable(t,"ref"),nodesById:t};return g};o.prototype.setHierarchy=function(e,t,i){var r=t.get({returnType:"Object",filter:i});var s=t.get();function a(t,i){if(t.level)return;t.level=i;for(var o=0;o<s.length;o++){var n=s[o];if(n.from===t.id){var d=e[n.to];if(r[n.id]){a(d,i+1)}else{a(d,i)}}else if(n.to===t.id){var h=e[n.from];if(r[n.id]){a(h,i-1)}else{a(h,i)}}}}e:for(var o in e){for(var n in s){if(e[o].level||e[o].id===s[n].to){continue e}}a(e[o],1e3)}};o.prototype.isViewBound=function(){return s.startsWith(this.getViewHolderRef(),this.opt.path.localHolders)};o.prototype.isViewSwitched=function(e){if(this.isViewBound()){return false}else{return s.hasOwnProp(e,this.getViewHolderRef())}};o.prototype.checkOnEditorBar=function(e,t,i){if(t||i.length){this.removeChildDomNodes();this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode);return true}else{return this.refreshChildren(e)}};o.prototype.checkOnGraph=function(e){var t=this.getView().getNodeFilter("compiled");var i=s.getMatches(t,Object.keys(e));if(i.length){this.logger("info","modified nodes",i);this.rebuildGraph();return}else{for(var r in e){if(this.graphData.nodesByRef[r]){this.logger("info","obsolete node",i);this.rebuildGraph();return}}}var a=this.getView().getEdgeFilter("compiled");var o=s.getMatches(a,Object.keys(e));if(o.length){this.logger("info","changed edge stores",o);this.rebuildGraph();return}};o.prototype.initAndRenderGraph=function(e){this.logger("info","Initializing and rendering the graph");if(this.editorMode){var t=this.makeChildWidget({type:"dropzone"});t.render(e);this.graphDomNode=t.findFirstDomNode()}else{this.graphDomNode=document.createElement("div");e.appendChild(this.graphDomNode)}$tw.utils.addClass(this.graphDomNode,"vis-graph");e.style["width"]=this.getAttribute("width","100%");if(this.getAttribute("height")){this.graphDomNode.style["height"]=this.getAttribute("height")}else{window.addEventListener("resize",this.handleResizeEvent.bind(this),false);this.maxEnlargeGraphContainer()}window.addEventListener("click",this.handleClickEvent.bind(this),false);this.graphOptions=this.getGraphOptions();this.network=new a.Network(this.graphDomNode,{nodes:[],edges:[]},this.graphOptions);if(!this.editorMode){this.callbackRegistry.add("$:/state/sidebar",this.repaintGraph.bind(this),false)}if(s.tiddlerExists(this.getAttribute("refresh-trigger"))){this.callbackRegistry.add(this.getAttribute("refresh-trigger"),function(){this.lastNodeDoubleClicked=null;this.rebuildGraph()}.bind(this),false)}this.network.on("doubleClick",this.handleDoubleClickEvent.bind(this));this.network.on("stabilized",this.handleStabilizedEvent.bind(this));this.network.on("dragStart",this.handleNodeDragStart.bind(this));this.network.on("dragEnd",this.handleNodeDragEnd.bind(this));this.addGraphButtons({surface:function(){this.lastNodeDoubleClicked=null;this.setGraphButtonEnabled("surface",false);this.rebuildGraph()}});this.rebuildGraph()};o.prototype.getGraphOptions=function(){var e=this.wiki.getTiddlerData(this.opt.ref.visOptions);e.onDelete=function(e,t){this.handleRemoveElement(e)}.bind(this);e.onConnect=function(e,t){this.handleConnectionEvent(e)}.bind(this);e.onAdd=function(e,t){this.insertNode(e)}.bind(this);e.onEditEdge=function(e,t){this.handleReconnectEdge(e)}.bind(this);e.dataManipulation={enabled:this.editorMode?true:false,initiallyVisible:this.view.getLabel()!=="quick_connect"&&this.view.getLabel()!=="search_visualizer"};e.navigation={enabled:true};if(this.getView().getConfig("layout.active")==="hierarchical"){e.hierarchicalLayout.enabled=true;e.hierarchicalLayout.layout="direction"}e.clickToUse=this.getAttribute("click-to-use")!=="false";return e};o.prototype.handleCreateView=function(){this.dialogManager.open("getViewName",null,function(e,t){if(e){var i=this.adapter.createView(s.getText(t));this.setView(i.getRoot())}})};o.prototype.handleRenameView=function(){if(this.getView().getLabel()==="default"){$tw.tiddlymap.notify("Thou shalt not rename the default view!");return}this.dialogManager.open("getViewName",null,function(e,t){if(e){this.view.rename(s.getText(t));this.setView(this.view.getRoot())}})};o.prototype.handleEditView=function(){var e={"var.edgeFilterExpr":this.getView().getEdgeFilter("expression"),dialog:{preselects:this.getView().getConfig()}};this.dialogManager.open("editView",e,function(e,t){if(e&&t){var i=s.getPropertiesByPrefix(t.fields,"config.");this.getView().setConfig(i)}})};o.prototype.handleDeleteView=function(){var e=this.getView().getLabel();if(e==="default"){$tw.tiddlymap.notify("Thou shalt not kill the default view!");return}var t="[regexp:text[<\\$tiddlymap.*?view=."+e+"..*?>]]";var i=s.getMatches(t);if(i.length){var r={count:i.length.toString(),filter:t};this.dialogManager.open("cannotDeleteViewDialog",r,null);return}var a="You are about to delete the view "+"''"+e+"'' (no tiddler currently references this view).";this.openStandardConfirmDialog(function(t){if(t){this.getView().destroy();this.setView(this.opt.path.views+"/default");$tw.tiddlymap.notify('view "'+e+'" deleted ')}},a)};o.prototype.handleReconnectEdge=function(e){var t=this.graphData.edges.get(e.id);$tw.utils.extend(t,e);this.adapter.deleteEdgesFromStore([{id:t.id,label:t.label}],this.getView());this.adapter.insertEdge(t,this.getView());this.preventNextRepaint=true};o.prototype.handleRemoveElement=function(e){if(e.edges.length&&!e.nodes.length){this.adapter.deleteEdgesFromStore(this.graphData.edges.get(e.edges),this.getView());$tw.tiddlymap.notify("edge"+(e.edges.length>1?"s":"")+" removed")}if(e.nodes.length){this.dialogManager.open("deleteNodeDialog",{},function(t){if(!t)return;var i=this.graphData.nodes.get(e.nodes);var r=this.graphData.edges.get(e.edges);this.adapter.deleteNodesFromStore(i);this.adapter.deleteEdgesFromStore(r,this.getView());$tw.tiddlymap.notify("node"+(e.nodes.length>1?"s":"")+" removed")})}};o.prototype.handleImportTiddlers=function(e){var t=this.network.getCenterCoordinates();var i=JSON.parse(e.param);for(var r=0;r<i.length;r++){var a=this.wiki.getTiddler(i[r].title);if(!a){this.notify("Cannot integrate foreign tiddler");return}if(s.isMatch(a,this.getView().getNodeFilter("compiled"))){this.notify("Node already exists");continue}var o=this.adapter.createNode(a,{});if(o){this.getView().addNodeToView(o);this.rebuildGraph()}}};o.prototype.handleStorePositions=function(){this.adapter.storePositions(this.network.getPositions(),this.getView());$tw.tiddlymap.notify("positions stored")};o.prototype.handleEditNodeFilter=function(){var e={prettyFilter:this.getView().getPrettyNodeFilterExpr()};this.dialogManager.open("editNodeFilter",e,function(t,i){if(t){this.getView().setNodeFilter(s.getText(i,e.prettyFilter))}})};o.prototype.handleStabilizedEvent=function(e){if(!this.hasNetworkStabilized){this.hasNetworkStabilized=true;this.logger("log","Network stabilized after "+e.iterations+" iterations");this.setNodesMoveable(this.graphData.nodes.getIds(),this.getView().isConfEnabled("physics_mode"))}};o.prototype.setNodesMoveable=function(e,t){this.network.storePositions();var i=[];for(var r=0;r<e.length;r++){i.push({id:e[r],allowedToMoveX:t,allowedToMoveY:t})}this.graphData.nodes.update(i)};o.prototype.insertNode=function(e){this.preventNextRepaint=true;this.adapter.insertNode(e,{view:this.getView(),editNodeOnCreate:false})};o.prototype.handleDoubleClickEvent=function(e){if(!e.nodes.length&&!e.edges.length){if(!this.editorMode){return}this.dialogManager.open("getNodeName",null,function(t,i){if(t){var r=e.pointer.canvas;r.label=s.getText(i);this.insertNode(r)}})}else{if(e.nodes.length){var t=this.graphData.nodes.get(e.nodes[0]);this.logger("debug","Doubleclicked on node",t);this.lastNodeDoubleClicked=t;var i=t.ref;if(this.getView().isConfEnabled("node_diving")){this.setGraphButtonEnabled("surface",true);var r=2e3;this.preventNextRepaint=true;this.rebuildGraph();this.network.zoomExtent({duration:r})}}else if(e.edges.length){this.logger("debug","Doubleclicked on an Edge");var a=this.graphData.edges.get(e.edges[0]);var o=a.label?a.label:this.opt.misc.unknownEdgeLabel;var i=this.getView().getEdgeStoreLocation()+"/"+o}this.dispatchEvent({type:"tm-navigate",navigateTo:i})}};o.prototype.handleResizeEvent=function(e){if(this.network){this.maxEnlargeGraphContainer();this.repaintGraph()}};o.prototype.destruct=function(){window.removeEventListener("resize",this.handleResizeEvent);this.network.destroy()};o.prototype.handleClickEvent=function(e){if(!document.body.contains(this.parentDomNode)){window.removeEventListener("click",this.handleClickEvent);return}if(this.network){var t=document.elementFromPoint(e.clientX,e.clientY);if(!this.parentDomNode.contains(t)){this.network.selectNodes([])}}};o.prototype.handleNodeDragEnd=function(e){console.log(this.getView().getConfig("layout.active"));if(e.nodeIds.length&&!this.hasStartedDiving()&&this.getView().getConfig("layout.active")!=="hierarchical"){var t=this.getView().isConfEnabled("physics_mode");this.setNodesMoveable([e.nodeIds[0]],t);this.handleStorePositions()}};o.prototype.handleNodeDragStart=function(e){if(e.nodeIds.length){this.setNodesMoveable([e.nodeIds[0]],true)}};o.prototype.getViewHolderRef=function(){if(this.viewHolderRef){return this.viewHolderRef}this.logger("info","Retrieving or generating the view holder reference");var e=this.getAttribute("view");if(e){this.logger("log",'User wants to bind view "'+e+'" to graph');var t=this.opt.path.views+"/"+e;if(this.wiki.getTiddler(t)){var i=this.opt.path.localHolders+"/"+s.genUUID();this.logger("log",'Created an independent temporary view holder "'+i+'"');this.wiki.addTiddler(new $tw.Tiddler({title:i,text:t}));this.logger("log",'View "'+t+'" inserted into independend holder')}else{this.logger("log",'View "'+e+'" does not exist')}}if(typeof i==="undefined"){this.logger("log","Using default (global) view holder");var i=this.opt.ref.defaultGraphViewHolder}return i};o.prototype.setView=function(e,t){if(e){if(!t){t=this.viewHolderRef}this.logger("info",'Inserting view "'+e+'" into holder "'+t+'"');this.wiki.addTiddler(new $tw.Tiddler({title:t,text:e}))}this.view=this.getView(true)};o.prototype.getView=function(e){if(!e&&this.view){return this.view}var i=this.getViewHolderRef();var r=this.wiki.getTiddler(i).fields.text;this.logger("info",'Retrieved view "'+r+'" from holder "'+i+'"');if(s.tiddlerExists(r)){return new t(r)}else{this.logger("log",'Warning: View "'+r+"\" doesn't exist. Default is used instead.");return new t("default")}};o.prototype.repaintGraph=function(){this.logger("info","Repainting the whole graph");this.network.redraw();this.network.zoomExtent()};o.prototype.maxEnlargeGraphContainer=function(){var e=window.innerHeight;var t=s.getDomNodePos(this.graphDomNode).y;var i=this.getAttribute("bottom-spacing","10px");var r=e-t+"px";this.graphDomNode.style["height"]="calc("+r+" - "+i+")"};o.prototype.setGraphButtonEnabled=function(e,t){var i="network-navigation tiddlymap-button "+e;var r=this.parentDomNode.getElementsByClassName(i)[0];$tw.utils.toggleClass(r,"enabled",t)};o.prototype.addGraphButtons=function(e){var t=this.parentDomNode.getElementsByClassName("vis network-frame")[0];for(var i in e){var r=document.createElement("div");r.className="network-navigation tiddlymap-button "+i;r.addEventListener("click",e[i].bind(this),false);t.appendChild(r)}};exports.tiddlymap=o})();