
import go from 'gojs';
import * as otInterface from '@features/operator/ot/services/interface';
import { types, ConfigInterface, getColorProtocol } from '../ot.utility';
// unknown must always be first for external use to get the label for the unknown
export const squareAssetWidth:number = 35;

export const OtGlobal :ConfigInterface =  {
  linkShape : 'LINK_SHAPE',
  linkArrow : 'LINK_ARROW',
  conversation : 'Conversation',
  zone : 'Zone',
  asset: 'Asset',
  undiscoveredAsset: 'Undiscovred asset',
  yellow : 'var(--radm-lightblue)'
};

export function getDiagram(){
  const diagram = new go.Diagram();
  diagram.initialContentAlignment = go.Spot.TopLeft;
  diagram.scrollMode = go.ScrollMode.Document;
  diagram.allowDragOut = diagram.allowRelink = false;
  diagram.allowDrop = diagram.allowInsert = true;
  diagram.undoManager.isEnabled =  true;
  return diagram;
}
  /**
   * Grid layout for all diagram
   * @returns
   */
  export function getLayoutLevels(): go.GridLayout {
    const level = new go.GridLayout({
      wrappingWidth: Infinity,
      wrappingColumn: 1, // ensures one group per row
      alignment: go.GridAlignment.Position,
      cellSize: new go.Size(Infinity, 0), // forces full width ( , height of levels)
      spacing: new go.Size(0, 30), // space between rows (groups),
    });
    return level;
  }

  /**
   * Get Template for zones/group in diagram
   * @returns
   */
  export function getZoneTemplate():go.Group{
    const groupTemplate = new go.Group(go.Panel.Auto, {
      locationSpot: go.Spot.Left,
      name: 'ot-zones',
      stretch: go.Stretch.Horizontal,
      width: NaN,
      layout: new go.GridLayout({
        wrappingColumn: 15, // max 15 assets par ligne
        spacing: new go.Size(10, 10), // espace entre assets
        alignment: go.GridAlignment.Location
      })
    });

    // add a shape to the group (background rectangle) remove the stroke
    const shape = new go.Shape('RoundedRectangle' ,{
      strokeWidth: 0,
      margin:0,
      stroke: "lightgray",
      fill: "transparent",
      stretch: go.Stretch.Fill,
      height: NaN,
      alignment: go.Spot.TopLeft,
      name: "ZoneBackground"
    }).bind(
      // Bind the fill color conditionally based on whether it's the first group
      new go.Binding('', '', (data:any , shape:go.Shape) => {
        if(data.isLevel == true) {
          shape.figure = "Rectangle";
          shape.fill = "transparent";
          shape.stroke = 'lightgray';
          shape.strokeWidth = 1;
          shape.name ="LEVEL";
          return shape;
        }else{
          shape.name ="ZONE";
          shape.minSize = new go.Size(squareAssetWidth * 3, squareAssetWidth * 2.9);
        }
        // first level
        if (data.isLevel == true && data.row == 4) return shape.fill = 'tomato'; // Color red for the last level/layer
        // other level than the first level
        if (data.isLevel == true && data.row !== 4) return shape.fill = 'transparent'; // Default others layers/level than the last level
        // the group
        return shape.fill = 'lightgray'; // color for zones
      })
    );

    // Create a vertical panel to hold the group contents
    const panel = getPanel();

    // Add the Shape and the Panel to the Group template
    groupTemplate.add(shape);
    groupTemplate.add(panel);
    groupTemplate.computesBoundsIncludingLocation = true;
    // when the selection is dropped into a Group, add the selected Parts into that Group;
    // if it fails, cancel the tool, rolling back any changes
    groupTemplate.movable = false;  // cannot move
    groupTemplate.deletable = false; // cannot delete
    groupTemplate.copyable = false; // cannot copy
    groupTemplate.selectionAdorned = true;// cannot select
    groupTemplate.computesBoundsAfterDrag = true;  // change size when draggin asset from
    groupTemplate.handlesDragDropForMembers = true;
    return groupTemplate;
  }

  /**
   * Object Palette with layout
   * @returns
   */
    export function getPalette() : go.Palette{
      const palette : go.Palette = new go.Palette("otPalette", {
        // customize the GridLayout to align the centers of the locationObjects
        layout: new go.GridLayout({ alignment: go.GridAlignment.Location })
      });
      palette.nodeTemplate = new go.Node("Auto", {locationObjectName: "TB", locationSpot: go.Spot.Center,padding: 0})
      .add(
        new go.Shape({ width: 50, height: 50, fill: "white" }).bind("fill", "color"),
        new go.TextBlock({ name: "TB" }).bind("text", "color")
      );
      // allow some interaction for drag and drop
      palette.model.undoManager.isEnabled = true;
      palette.allowDragOut = true;
      palette.allowDelete = true;
      palette.allowZoom = false;
      return palette;
    }

  /**
   *
   * the costum template for the assets
   */
  export function getTemplateAssets() : go.Node{

     // Asset object/node using a Vertical Panel to align image and text vertically
    const asset: any = new go.Node('Vertical',{
        locationSpot: go.Spot.Bottom,
        locationObjectName: 'BODY',
        selectionObjectName: 'BODY',
        name:'ASSET'
      })
    // Panel containing image and text
    const panel = new go.Panel(go.Panel.Vertical, {
      stretch: go.Stretch.Fill
    });

    // Picture for the asset image
    const picture: go.Picture =  new go.Picture({
      name: 'BODY',
      width: squareAssetWidth ,
      height: squareAssetWidth,
      fromLinkable: true,
      toLinkable: true,
      position: new go.Point(0, 0),
      cursor: 'pointer',
      alignment: go.Spot.Top
    })

    picture.bind('source', 'type', (type:any) => getImageSvg(type))

    // Text for the asset name, aligned below the image
    const text: go.TextBlock =  new go.TextBlock({
        text: 'n/a',
        font: '8pt sans-serif',
        textAlign: 'center',
        width: squareAssetWidth * 2.5, // Ensure the text block is larger than the image
        overflow: go.TextOverflow.Clip,
        maxLines: 1,
        alignment: go.Spot.Bottom
      });
      text.bind('text', '' ,  getLabelAssetFromJson )
      // Bind asset's location to model data
      panel.bindTwoWay('', 'loc', go.Point.parse, go.Point.stringify);

      panel.add(picture);
      panel.add(text)
      asset.add(panel);
    return asset;
  }
  /**
   * Check in the raw json object there are key product_commercial_name or id else show n/a
   * @param raw
   * @returns
   */
  function getLabelAssetFromJson(asset:any){
    if(asset.raw){
      if(asset.raw.nomclientusuel ){
        return asset.raw.nomclientusuel;
      }else if(asset.raw.productcommercialname ){
        return asset.raw.productcommercialname;
      }else if( asset.raw.macaddress){
        return asset.raw.macaddress;
      }else if(asset.raw.ipaddress){
        return asset.raw.ipaddress;
      }else{
        'n/a';
      }
    }else{
      return asset.ip ?? 'n/a';
    }
  }

    /**
   * Add the lins
   * Separated function for better code understanding
   */
    export function getTemplateLinks(): go.Link{
      const linkColor = 'black'; // color defaults for links
      // default object for line links shape
      const lineShape = {
        stroke: linkColor,
        strokeWidth: 3,
        name: OtGlobal.linkShape,

      };
      // default object for arraow links shape
      const arrowShape = {
        toArrow: "Triangle",
        stroke: 'transparent',
        fill: linkColor,
        name: OtGlobal.linkArrow,
        scale: 1.5
      };
      // link object
      const linkTemplate =  new go.Link({
        routing: go.Routing.Orthogonal,  // may be either Orthogonal or AvoidsNodes
        curve: go.Curve.JumpGap,
        // curve: go.Curve.JumpOver,
        // routing: go.Routing.AvoidsNodes,
        relinkableFrom: false,
        relinkableTo: false,
        corner: 10    // rounded corners
      })
      .add(
        new go.Shape(lineShape).bind('stroke','',(e:any) => getColorProtocol(e.protocols)), // change the color of link by protocol
        new go.Shape(arrowShape).bind('stroke','',(e:any) => getColorProtocol(e.protocols)) ,
        new go.Shape(arrowShape).bind('stroke','',(e:any) => getColorProtocol(e.protocols)) ,
        new go.Shape(arrowShape).bind('fill','',(e:any) => getColorProtocol(e.protocols))
      );
      return linkTemplate;
    }

  /**
   * Get the path to svg image icons
   * @param type
   * @returns
   */
    export function getImageSvg(type: string): string {
      type = type.toLowerCase();
      const unknown : string = "other_virtual_metier";
      if (type == "unknown") return `assets/images/ot/${unknown}.png`;
      // if we cannot find the icon we search in the name of the file if we find some clues for the type
      for (const category of types) {
        for (const types of category.value) {
          if (types.key == type) {
            return `assets/images/ot/${types.default}.png`;
          }
        }
      }
      return `assets/images/ot/${unknown}.png`;
    }

  /**
   * Get only the asset objects dismiss the zones and levels and include the missing asstes that are dropped in the diagram
   * @param nodes
   * @returns
   */
  export function  extractAssetsListFromNode(nodes:any[]): otInterface.Asset[]{
    const assets : otInterface.Asset[] =[];
    const na : string|null = null;
    if(nodes.length > 0 ){
      nodes.forEach( (node: any) => {
        // if we dont have the raw  and not group key then its the unknown asset
        if(!node.raw && !node.isGroup){
          const asset : otInterface.Asset = {
            belongingzone: node.group ?? na,
            champsdescriptif: na,
            criticity: "Medium",
            id: node.id ?? na ,
            ipaddress: node.ip ?? na,
            macaddress: node.mac_adress ?? na,
            nomclientusuel: node.ip ?? na,
            productcommercialname: node.ip ?? na,
            robustesse: 0,
            type: node.type ?? na
          };
          assets.push( asset );// add the unknown asset
        }else if(node.raw && !node.isGroup){ // if its not a group and have a raw then is a existing asset
          assets.push( node.raw );// add the existing unknown asset
        }
      });
    }
    return assets;
  }

/**
 * Flattern object to represent better infos
 * @param obj
 * @param banKeyList the list of keys to be banned from the list
 * @returns
 */
  export function flattenObject(
    obj: Record<string, any> ,
    banKeyList: string[] = [ 'key', 'assetSrc' , 'assetDest','from', 'to' ]
  ): Record<string, any> {
    const result: Record<string, any> = {};
    // change object for assert src and dest cause they have the same keys
    ['assetSrc','assetDest'].forEach(key => {
      if(obj[key]){
        for ( const index in obj[key]) {
          // add a new key with some mikmak to change the index and add the value in it
          obj[`${key.replace("asset" , "").toLowerCase()}_${index}`] = obj[key][index];
        }
      }
    })
    const recurse = (currentObj: Record<string, any>): void => {
      for (const key in currentObj) {
        if( !banKeyList.includes(key) ){
        if (currentObj.hasOwnProperty(key)) {
          // if the value is an object, recurse; otherwise, store the value
          if (
            typeof currentObj[key] === 'object' &&
            currentObj[key] !== null &&
            !Array.isArray(currentObj[key])
          ) {
            recurse(currentObj[key]);
          } else {
            result[key] = currentObj[key];
          }
        }
        }
      }
    };
    recurse(obj);
    // add sort object key
    return Object.fromEntries(
      Object.entries(result).sort((a, b) => b[0].localeCompare(a[0]))
    );;
  }

  function getPanel():go.Panel{
    const panel =  new go.Panel(go.Panel.Vertical );
    // Create a TextBlock for the group title
    const textZoneName = new go.TextBlock({
      font: 'bold 10pt sans-serif',
      margin: 5,
      textAlign:  "center" ,
      visible: false
    }).bind(
      new go.Binding('', '' , (data:otInterface.GoGroup , node:any )=> {
      // if the node is zone then show the text dezired
      if(!data.isLevel){
        node.text = `${data.raw.name.toUpperCase()}`;
        node.visible = true;
      }
      return node;
    }));

    // return the id of the zone
    // Placeholder for the group's members (nodes or groups)
    const placeholder = new go.Placeholder({
      padding : 5,
      background: "transparent",
      stretch: go.Stretch.Fill
    });
    // Add TextBlock and Placeholder to the Panel
    panel.add(textZoneName);
    panel.add(placeholder);
    return panel;
  }
