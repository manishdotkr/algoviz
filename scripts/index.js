$(".category-head").click(function(){
    const currentSection = $('.'+this.id);
    if(currentSection.hasClass('active')) {
        currentSection.removeClass('active')
    return;
};
    $('.sub-category-container').removeClass("active").attr('data-visible', 'false');
    setTimeout(() => {
        currentSection.attr('data-visible', 'true');
        $('.sub-category-container[data-visible="true"]').addClass("active");
    }, 10);
});
