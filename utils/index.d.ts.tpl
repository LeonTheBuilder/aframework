export class SharedServices {
    <% for (let serviceIndex = 0; serviceIndex < sharedFields.length; serviceIndex++) { %>
        <%- sharedFields[serviceIndex].fieldName %>: <%- sharedFields[serviceIndex].fieldClassName %>;
    <% } %>
}

<% for (let classIndex = 0; classIndex < classDefList.length; classIndex++) { %>
export declare class <%- classDefList[classIndex].className %>
    <% if(classDefList[classIndex].extendBaseClass === '1'){ %>
               extends SharedServices
    <% } %>
    {
    <% for (let methodIndex = 0; methodIndex < classDefList[classIndex]['methods'].length; methodIndex++) { %>
        <% if(classDefList[classIndex]['methods'][methodIndex].isStatic === '1'){ %>static <% } %><%- classDefList[classIndex]['methods'][methodIndex].methodName %>(args: any)<% if(classDefList[classIndex]['methods'][methodIndex].isAsync === '1'){ %> : Promise<any>;<% } else { %> : any; <% } %>
    <% } %>
}
<% } %>


