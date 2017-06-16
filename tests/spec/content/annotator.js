define([
    'streamhub-sdk/content/annotator',
    'streamhub-sdk/content/annotator-extensions',
    'stream/writable',
    'streamhub-sdk/content/types/livefyre-content',
    'json!streamhub-sdk-tests/mocks/bootstrap-data.json',
    'streamhub-sdk/jquery',
    'inherits'],
function (Annotator, AnnotatorExtensions, Writable, LivefyreContent, mockBootstrapData, $, inherits) {
    'use strict';

    describe('streamhub-sdk/content/annotator', function () {
        it('is a Writable', function () {
            expect(Annotator.prototype instanceof Writable).toBe(true);
        });

        var annotator = new Annotator();
        var featuredmessage = {
            featuredmessage: {
                rel_collectionId: '10739960',
                value: 1381771896
            }
        };
        var likedBy = {
            likedBy: ['authorId1', 'authordId2']
        };
        var sortOrder = {
            sortOrder: 10 // epoch time
        };
        var moderatorTrue = {
            moderator: true
        };
        var lfContent;
        var vote = {
            vote: [{
                collectionId: '2486003',
                value: 1,
                author: 'default@livefyre.com'
            }]
        };
        var downVote = {
            vote: [{
                collectionId: '2486003',
                value: 2,
                author: 'default@livefyre.com'
            }]
        };
        var links = {
            links: {
                product: [{
                    oembed: {
                        url: 'http://www.hallmark.com/dw/image/v2/AALB_PRD/on/demandware.static/-/Sites-hallmark-master/default/dwdc14a30c/images/finished-goods/itty-bittys-My-Little-Pony-Rainbow-Dash-Stuffed-Animal-root-1KDD1252_KDD1252_1470_1.jpg_Source_Image.jpg?sw=625&sh=625&sm=fit'
                    },
                    price: '$6.95',
                    title: 'itty bittys® My Little Pony™ Rainbow Dash Stuffed Animal',
                    url: 'http://www.hallmark.com/gifts/stuffed-animals/itty-bittys/itty-bittys-my-little-pony-rainbow-dash-stuffed-animal-1KDD1252.html',
                    urn: 'urn:livefyre:qa-blank.fyre.co:product=a012b658-4ced-452a-8a6a-108bb1c99879'
                }]
            }
        };
        var rights = {
            rights: {
                status: 'granted'
            }
        };

        beforeEach(function () {
            lfContent = new LivefyreContent({});
        });

        describe('Annotator#annotate', function () {
            it('can add likedBy annotations', function () {
                annotator.annotate(lfContent, {
                    'added': likedBy
                });

                expect(lfContent.getLikeCount()).toEqual(likedBy.likedBy.length);
            });

            it('can remove likedBy annotations', function () {
                annotator.annotate(lfContent, {
                    'added': likedBy
                });
                annotator.annotate(lfContent, {
                    'removed': likedBy
                });

                expect(lfContent.getLikeCount()).toEqual(0);
            });

            it('can add sortOrder annotations', function () {
                annotator.annotate(lfContent, {
                    'added': sortOrder
                });

                expect(lfContent.sortOrder).toEqual(sortOrder.sortOrder);
            });

            it('can remove sortOrder annotations', function () {
                annotator.annotate(lfContent, {
                    'removed': sortOrder
                });

                expect(lfContent.sortOrder).toEqual(null);

            });

            it('can add featuredmessage annotations', function () {
                annotator.annotate(lfContent, {
                    'added': featuredmessage
                });

                expect(lfContent.getFeaturedValue()).toEqual(jasmine.any(Number));
            });

            it('can remove featuredmessage annotations', function () {
                annotator.annotate(lfContent, {
                    'removed': featuredmessage
                });

                expect(lfContent.getFeaturedValue()).toEqual(undefined);
            });

            it('can add moderater annotations', function () {
                annotator.annotate(lfContent, {
                    'added': moderatorTrue
                });

                expect(lfContent.moderator).toEqual(true);
            });

            it('can remove moderater annotations', function () {
                annotator.annotate(lfContent, {
                    'removed': moderatorTrue
                });

                expect(lfContent.moderator).toEqual(false);
            });

            it('can add links (product) annotations', function () {
                annotator.annotate(lfContent, {
                    'added': links
                });

                expect(lfContent.links).toEqual(links.links);
            });

            it('can remove links (product) annotations', function () {
                annotator.annotate(lfContent, {
                    'removed': links
                });

                expect(lfContent.links).toEqual({});
            });

            it('can add rights annotations', function () {
                annotator.annotate(lfContent, {
                    'added': rights
                });

                expect(lfContent.rights).toEqual(rights.rights);
            });

            it('can remove rights annotations', function () {
                annotator.annotate(lfContent, {
                    'removed': rights
                });

                expect(lfContent.rights).toEqual({});
            });
        });

        describe('Annotator w/ votes', function () {
            var annotator, AnnotatorWithVotes;

            beforeEach(function () {
                AnnotatorWithVotes = function () {
                    Annotator.call(this);
                    AnnotatorExtensions.withVotes(this);
                };
                inherits(AnnotatorWithVotes, Annotator);

                annotator = new AnnotatorWithVotes();
            });

            it('can be extended with VoteAnnotator', function () {
                expect(annotator.added.vote).toBeDefined();
                expect(annotator.added.featuredmessage).toBeDefined();
            });

            it('can add vote annotations', function () {
                annotator.annotate(lfContent, {
                    'added': vote
                });

                expect(lfContent.votes.helpfulness).toEqual(1);
                expect(lfContent.votes.downvotes).toEqual(0);
                expect(lfContent.votes.list.length).toEqual(1);
            });

            it('only adds a vote annotation if a vote for the same user does not already exist', function () {
                annotator.annotate(lfContent, {
                    'added': vote
                });

                expect(lfContent.votes.helpfulness).toEqual(1);
                expect(lfContent.votes.downvotes).toEqual(0);
                expect(lfContent.votes.list.length).toEqual(1);

                annotator.annotate(lfContent, {
                    'added': vote
                });

                expect(lfContent.votes.helpfulness).toEqual(1);
                expect(lfContent.votes.downvotes).toEqual(0);
                expect(lfContent.votes.list.length).toEqual(1);
            });

            it('can update vote annotations', function () {
                annotator.annotate(lfContent, {
                    'added': vote
                });

                annotator.annotate(lfContent, {
                    'updated': downVote
                });

                expect(lfContent.votes.helpfulness).toEqual(-1);
                expect(lfContent.votes.downvotes).toEqual(1);
                expect(lfContent.votes.list.length).toEqual(1);
            });

            it('can remove vote annotations', function () {
                annotator.annotate(lfContent, {
                    'added': vote
                });

                annotator.annotate(lfContent, {
                    'removed': downVote
                });

                expect(lfContent.votes.helpfulness).toEqual(0);
                expect(lfContent.votes.downvotes).toEqual(0);
                expect(lfContent.votes.list.length).toEqual(0);
            });
        });
    });
});
