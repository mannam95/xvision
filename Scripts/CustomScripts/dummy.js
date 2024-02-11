var editableAdmin = false;
	var editableF = false;
    var buttonLock = false;


$(document).ready(function() {
	if (admin){
		editableAdmin = true;
		editableF = true;
	}
	if (editor){
		editableF = true;
	}

    var partTypes=[
    	{"value":"","text":""},
    	{"value":"NEW","text":"NEW"},
    	{"value":"NWC","text":"NWC"},    	
    	{"value":"REMAN","text":"REMAN"},
    	{"value":"REPAIR/RETURN","text":"REPAIR/RETURN"},
		{"value":"UTN","text":"UTN"},
		{"value":"WARRANTY ONLY","text":"WARRANTY ONLY"}
    	];
    var salesChannels= [
    	{"value":"","text":""},
    	{"value":"CAT YELLOW","text":"CAT YELLOW"},
    	{"value":"EXTERNAL","text":"EXTERNAL"},
    	{"value":"NPI (TEMP)","text":"NPI (TEMP)"},
    	{"value":"PERKINS","text":"PERKINS"}
    	];
    

    var gateWayProjectRPSObjcolM = [
    	
    	{
        title: "Project ID",
        dataType: "Long",
        dataIndx: "projectId",
        width: 30,
        hidden: true,
        editable: false
    },{
    width: 140,
    align: "center",
    colModel: [{
        title: "<b>Inactive</b>",
        dataType: "String",
        dataIndx: "inactive",
        width: 70,
        editable: true,
        cls: 'silver' }]
    },{
    //Delete button 
    width: 140,
    align: "center",
    colModel: [{
        title: "<b>Delete</b>",
        dataType: "String",
        dataIndx: "delete",
        width: 70,
        editable: true,
        cls: 'silver' }]
    },{
    width: 140,
    align: "center",
    colModel: [{
        title: "<b>Part No</b>",
        dataType: "String",
        dataIndx: "partNo",
        width: 70,
        editable: false,
        cls: 'silver' }]
    },  {
    title: "<b>Reman Parts Structure</b>",
    width: 1230,
    align: "center",
    colModel: [ 
    	 {

             title: "Facility ID",
             dataType: "Long",
             dataIndx: "facilityId",
             width: 50,
             hidden: true,
             editable: false
         },
    	{

                title: "<b>Facility</b>",
                dataType: "string",
                dataIndx: "facility",
                editable : editableF,
                width: 150,
                editor: {
                    type: 'select',
                    valueIndx: "tag",
    	            labelIndx: "description",
    	            options: function(ui) {
                		var res=[];
                		$.ajax({
                			Accept: 'application/json',
                            type: 'GET',
                            async: false,
                            url: "/npi/control/controller/gateway/seeds/forecasting/getFacility",
                            success: function(response) {
                            res=response;
                            }
                	});
                		return res;
         },
    	         
               getData: function(ui) {
                        var txt = ui.$cell.find("select").find("option:selected").text();
                        var id = ui.$cell.find("select").find("option:selected").val();
                        return {"facility": txt, "facilityId": id};
                   },
                 }
            },
            {

                title: "RPS Source Level ID",
                dataType: "Long",
                dataIndx: "rpsSourceId",
                width: 50,
                hidden: true,
                editable: false
            }, {
                title: "<b>RPS Source</b>",
                dataType: "String",
                dataIndx: "rpsSource",
                editable : editableF,
                width: 100,
                editor: {
                    type: 'select',
                    valueIndx: "tag",
    	            labelIndx: "description",
    	            options: function(ui) {
    	            	var selectedFacility=ui.rowData.facilityId;
    	            	if(selectedFacility){
                		var res=[];
                		$.ajax({
                			Accept: 'application/json',
                            type: 'GET',
                            async: false,
                            url: "npi/control/controller/gateway/seeds/forecasting/getRPSSourceList?facilityId="+selectedFacility,
                            success: function(response) {
                            res=response;
                            }
                	});
    	            	}
                		return res;
         },
               getData: function(ui) {
                        var txt = ui.$cell.find("select").find("option:selected").text();
                        var id = ui.$cell.find("select").find("option:selected").val();
                        return {"rpsSource": txt, "rpsSourceId": id};
                   },
                 }
             
            },
        	{
            title: "Business Level ID",
            dataType: "Long",
            dataIndx: "businessId",
            width: 50,
            hidden: true,
            editable: false
        }, {
            title: "<b>Business</b>",
            dataType: "String",
            dataIndx: "business",
            editable : editableF,
            width: 200,
            editor: {
                type: 'select',
                valueIndx: "tag",
	            labelIndx: "description",
	            options: function(ui) {
	            	var selectedRpsSourceLevelId=ui.rowData.rpsSourceId;
	            	if(selectedRpsSourceLevelId){
            		var res=[];
            		$.ajax({
            			Accept: 'application/json',
                        type: 'GET',
                        async: false,
                        url: "/npi/control/controller/gateway/seeds/forecasting/getMastersFamily/businessByRpsSource?rpsSourceLevelId="+selectedRpsSourceLevelId,
                        success: function(response) {
                        res=response;
                        }
            	});
	            	}
            		return res;
     },
           getData: function(ui) {
                    var txt = ui.$cell.find("select").find("option:selected").text();
                    var id = ui.$cell.find("select").find("option:selected").val();
                    return {"business": txt, "businessId": id};
               },
             }
         },{
             title: "Value Stream Level ID",
             dataType: "Long",
             dataIndx: "valueStreamId",
             width: 50,
             hidden: true,
             editable: false
         },  {
            title: "<b>Value Stream</b>",
            width: 180,
            dataType: "string",
            dataIndx: "valueSream",
            editable : editableF,
            editor: {
                type: 'select',
                valueIndx: "tag",
	            labelIndx: "description",
                options: function(ui) {
          		  var selectedBusiness=ui.rowData.businessId;
          		var res=[];
          		$.ajax({
          			Accept: 'application/json',
                      type: 'GET',
                      async: false,
                      url: "/npi/control/controller/gateway/seeds/forecasting/getMastersFamily/ValueStream?searchId=" + selectedBusiness,
                      success: function(response) {
                      res=response;
                      }
          	});
          		return res;
   },

                getData: function(ui) {
                    var txt = ui.$cell.find("select").find("option:selected").text();
                    var id = ui.$cell.find("select").find("option:selected").val();
                    return {"valueSream": txt, "valueStreamId": id};
              },
            }
        }, {
            title: "Product Level ID",
            dataType: "Long",
            dataIndx: "productId",
            width: 10,
            hidden: true,
            editable: false
        },{
            title: "<b>Product</b>",
            width: 150,
            dataType: "string",
            dataIndx: "product",
            editable : editableF,
            editor: {
                type: 'select',
                valueIndx: "tag",
	            labelIndx: "description",
                options: function(ui) {
           		 var selectedBusiness=ui.rowData.businessId;
        		 var selectedValueStreamDesc=ui.rowData.valueSream;
                        		var res=[];
                        		$.ajax({
                        			Accept: 'application/json',
                                    type: 'GET',
                                    async: false,
                                    url: "/npi/control/controller/gateway/seeds/forecasting/getMastersFamily/Product?searchId=" + selectedBusiness + "&family=" + selectedValueStreamDesc,
                                    success: function(response) {
                                    res=response;
                                    }
                        	});
                        		return res;
                 },
                getData: function(ui) {
                    var txt = ui.$cell.find("select").find("option:selected").text();
                    var id = ui.$cell.find("select").find("option:selected").val();
                    return {"product": txt, "productId": id};
              },
            }
        },
        {
            title: "<b>Part Type</b>",
            width: 100,
            dataType: "string",
            dataIndx: "partType",
            editable : editableF,
            editor: {
                type: 'select',
                valueIndx: "value",
	            labelIndx: "text",
                options: partTypes,
                getData: function(ui) {
                	var txt = ui.$cell.find("select").find("option:selected").text();
                    return {"partType": txt};
              },
            }
        },
        {
            title: "<b>Sales Channel</b>",
            width: 100,
            dataType: "string",
            dataIndx: "salesChannel",
            editable : editableF,
            editor: {
                type: 'select',
                valueIndx: "value",
	            labelIndx: "text",
                options: salesChannels,
                getData: function(ui) {
                	var txt = ui.$cell.find("select").find("option:selected").text();
                    return {"salesChannel": txt};
              },
            }
        },
        {
            title: "<b>Model</b>",
            width: 100,
            dataType: "string",
            dataIndx: "model",
            editable: editableF
            
        }]
}];



   
    var gateWayProjectRPSObj = {
            minWidth: 600,
            height: 350,
            scrollModel: {
                autoFit: true
            },
            trackModel: {
                on: true
            },
            // to turn on the track changes.
            toolbar: {
                items: [
                    {
                    type: 'button',
                    icon: 'ui-icon-plus',
                    label: 'Add',
                    disabled : !editableF,
                    listener: {
                        "click": function(evt, ui) {
                            // append default row at the end.
                            var rowData = {'partNo' : '',  
                                'facility' : '',
                                'business' : '',
                                'rpsSourceSearch' : '',
                                'business' : '',
                                'valueStream' : '',
                                'salesChannel' : '',
                                'product' : '',
                                'partType' : '',
                                'salesChannel' : '',
                                'model' : ''
                             };
                            // default values in row
                            var rowIndx = $gateWayProjectRPSGrid.pqGrid("addRow", {
                                rowData: rowData,
                                checkEditable: true
                            });
                            $gateWayProjectRPSGrid.pqGrid("goToPage", {
                                rowIndx: rowIndx
                            });
                            $gateWayProjectRPSGrid.pqGrid("editFirstCellInRow", {
                                rowIndx: rowIndx
                            });

                        }
                    },
                    options: {
                        disabled: buttonLock
                    }
                },{
                    type: 'button',
                    icon: 'ui-icon-disk',
                    label: 'Save Changes',
                    cls: 'changes',
                    disabled : !editableF,
                    listener: {
                        "click": function(evt, ui) {
                            updateGatewayProject($gateWayProjectRPSGrid, "/npi/control/controller/gateway/rps/forecasting/update", projectId, 2);
                        }
                    },
                    options: {
                        disabled: true
                    }
                }, {
                    type: 'button',
                    icon: 'ui-icon-cancel',
                    label: 'Reject Changes',
                    cls: 'changes',
                    listener: {
                        "click": function(evt, ui) {
                            $gateWayProjectRPSGrid.pqGrid("rollback");
                            $gateWayProjectRPSGrid.pqGrid("history", {
                                method: 'resetUndo'
                            });
                        }
                    },
                    options: {
                        disabled: true
                    }
                }, {
                    type: 'separator'
                }, {
                    type: 'button',
                    icon: 'ui-icon-arrowreturn-1-s',
                    label: 'Undo',
                    cls: 'changes',
                    listener: {
                        "click": function(evt, ui) {
                            $gateWayProjectRPSGrid.pqGrid("history", {
                                method: 'undo'
                            });
                        }
                    },
                    options: {
                        disabled: true
                    }
                }, {
                    type: 'button',
                    icon: 'ui-icon-arrowrefresh-1-s',
                    label: 'Redo',
                    listener: {
                        "click": function(evt, ui) {
                            $gateWayProjectRPSGrid.pqGrid("history", {
                                method: 'redo'
                            });
                        }
                    },
                    options: {
                        disabled: true
                    }
                }, {
                    type: 'separator'
                },{
                    type: 'button',
                    icon: 'ui-icon-arrowthickstop-1-s',
                    label: 'Download Parts',
                    cls: 'downloads',
                    listener: {
                    	"click": function(evt, ui) {
                    		var partNo = $('#partNo').val();
                    		var facility = $('#facility').val();
                    		var rpsSource = $('#rpsSourceSearch').val();
                    		var business = $('#business').val();
                    		var valueStream = $('#valueStream').val();
                    		var product = $('#product').val();
                    		var partType = $('#partType').val();
                    		var salesChannel = $('#salesChannel').val();
                    		var model = $('#model').val();
                    		downloadCSV(partNo, facility, rpsSource, business, valueStream, product, partType, salesChannel, model);
                        }
                    },
                    options: {
                        disabled: true
                    }
                }]
            },
            editModel: {
                saveKey: $.ui.keyCode.ENTER
            },
            editor: {
                select: true
            },
            history: function(evt, ui) {
                var $gateWayProjectRPSGrid = $(this);
                if (ui.canUndo != null) {
                    $("button.changes", $gateWayProjectRPSGrid).button("option", {
                        disabled: !ui.canUndo
                    });
                }
                if (ui.canRedo != null) {
                    $("button:contains('Redo')", $gateWayProjectRPSGrid).button("option", "disabled", !ui.canRedo);
                }
                $("button:contains('Undo')", $gateWayProjectRPSGrid).button("option", {
                    label: 'Undo (' + ui.num_undo + ')'
                });
                $("button:contains('Redo')", $gateWayProjectRPSGrid).button("option", {
                    label: 'Redo (' + ui.num_redo + ')'
                });
            },
            colModel: gateWayProjectRPSObjcolM,
            dataModel: {
                   data: rpsInfo
            },
            pasteModel: {on: true},
            cellSave: function (evt, ui) {
            	
                if (ui.dataIndx == "facilityName" && ui.newVal.facilityName !== ui.oldVal.facilityName) {      

                    $(this).pqGrid('updateRow', { rowIndx: ui.rowIndx,
                        row: { 'rpsSource': '', 'rpsSourceLevelId':'', 'mpfBusinesFamily': '','mpfBusinesFamilyLevelId': '','mpfValues': '','mpfValuesLevelId': '','mpfProduct': '','mpfProductLevelId': '' }
                    });

                }
                else if (ui.dataIndx == "rpsSource" && ui.newVal.rpsSource !== ui.oldVal.rpsSource) {      

                	$(this).pqGrid('updateRow', { rowIndx: ui.rowIndx,
                        row: { 'mpfBusinesFamily': '','mpfBusinesFamilyLevelId': '','mpfValues': '','mpfValuesLevelId': '','mpfProduct': '','mpfProductLevelId': '' }
                    });
                }
                else if (ui.dataIndx == "mpfBusinesFamily" && ui.newVal.mpfBusinesFamily !== ui.oldVal.mpfBusinesFamily) {      

                    $(this).pqGrid('updateRow', { rowIndx: ui.rowIndx,
                        row: { 'mpfValues': '','mpfValuesLevelId': '','mpfProduct': '','mpfProductLevelId': '' }
                    });

                }
                else if (ui.dataIndx == "mpfValues" && ui.newVal.mpfValues !== ui.oldVal.mpfValues) {      

                   // $(this).pqGrid('updateRow', { rowIndx: ui.rowIndx,
                   // row: { 'mpfValuesLevelId': '' }
                   // });

                }
            },
            
            load: function(event, ui) {
            	$("#gateWayProjectRPSGrid").find(".pq-grid-footer").empty();
                $("#gateWayProjectRPSGrid").find(".pq-grid-footer").prepend("<b><span style = 'float:left; color:black;'>Single-click highlights the cell and Double-click activates edit capability</span></b>");
            }     

           
            
        };


    var $gateWayProjectRPSSearchGrid = $("#gateWayProjectRPSSearchGrid").pqGrid(gateWayProjectRPSObj);

});