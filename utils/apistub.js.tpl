<% for (let classIndex = 0; classIndex < classes.length; classIndex++) { %>
class <%- classes[classIndex].name %>{
    <% for (let apiIndex = 0; apiIndex < classes[classIndex].apis.length; apiIndex++) { %>
    static async <%- classes[classIndex].apis[apiIndex].name %>(args){
        return await APICaller.post('<%- classes[classIndex].apis[apiIndex].uri %>', args||{});
    }
    <% } %>
}
<% } %>


