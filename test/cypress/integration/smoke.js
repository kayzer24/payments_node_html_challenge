import {
    verifyUrlNavigation,
    verifyNavbarNavigation,
    verifyButtonNavigation
} from '../support/navigation';

import {
    verifyAddRemoveTickets,
    verifyAddRemoveVideos,
    verifyAddRemoveLessons
} from '../support/postnav';

describe('Initial Smoke Test', () => {

    it('Should navigate to the Concerts page using the URL, the Navbar and the "Concerts" button', () => {
        verifyUrlNavigation('concert');
        verifyNavbarNavigation('concert');
        verifyButtonNavigation('concert');
    });

    it('Should have the right number of tickets after clicking the buy button on the "Concerts Checkout" page', () => {
        verifyUrlNavigation('concert');
        verifyAddRemoveTickets();
    });

    it('Should navigate to the Video Courses page using the URL, the Navbar and the "Video Courses" button', () => {
        verifyUrlNavigation('videos');
        verifyNavbarNavigation('videos');
        verifyButtonNavigation('videos');
    });

    it('Should have the right total and subtotal after selecting/removing any number of categories on the "Video Courses Checkout" page', () => {
        verifyUrlNavigation('videos');
        verifyAddRemoveVideos();
    });

    it('Should navigate to the Lesson Courses page using the URL, the Navbar and the "Lesson Courses" button', () => {
        verifyUrlNavigation('lessons');
        verifyNavbarNavigation('lessons');
        verifyButtonNavigation('lessons');
    });

    it('Should perform some basic steps in the Lesson Courses section', () => {
        verifyUrlNavigation('lessons');
        verifyAddRemoveLessons();
    });

});
