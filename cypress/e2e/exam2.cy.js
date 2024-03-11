import {faker} from '@faker-js/faker';
import postDataJ from '../fixtures/post.json';

describe('Exam unit 2 API', () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const titleFromF = faker.lorem.words();
    const postDataFromF = faker.lorem.sentence();
    const title = faker.lorem.words(3);
    const postDataF = faker.lorem.sentence();
    const titleU = faker.lorem.words(4);
    const postDataFU = faker.lorem.sentence(10);

    it("Get all posts", () => {
        cy.request("GET", "/posts").then((response) => {
            expect(response.status).to.eq(200);
            expect(response.headers['content-type']).to.include('application/json');
            expect(response.body).to.have.length.above(0);
            expect(response.body[0]).to.have.property('id');
            expect(response.body[0]).to.have.property('title');
        });
    });

    it('Get only first 10 posts', () => {
        cy.request('GET', '/posts?_start=0&_end=10')
            .then(response => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.lengthOf(10);
                for (let i = 1; i <= 10; i++) {
                    expect(response.body[i - 1].id).to.eq(i);
                }
            });
    });

    it('Get posts with id = 55 and id = 60', () => {
        cy.request('GET', '/posts?id=55&id=60')
            .then(response => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].id).to.eq(55);
                expect(response.body[1].id).to.eq(60);
            });
    });

    it('Create a post', () => {
        cy.request({
            method: 'POST', url: '/664/posts', body: {
                email: email, password: password
            }, failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.eq(401);
        });
    });

    it('Create post with adding access token in header', () => {
        let token;
        cy.request({
            method: 'POST', url: '/register', body: {
                email: email, password: password
            }, failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.equal(201);
            token = response.body.accessToken;
            const post = {
                title: titleFromF, body: postDataFromF
            }
            cy.request({
                method: 'POST', url: '/664/posts', headers: {
                    Authorization: `Bearer ${token}`
                }, body: post
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.title).to.equal(post.title);
                expect(response.body.body).to.equal(post.body);
            });
        });
    });

    it('Create post entity and verify that the entity is created', () => {
        cy.request('POST', '/posts', postDataJ)
            .then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('title', postDataJ.title);
                expect(response.body).to.have.property('body', postDataJ.body);
            });
    });

    it('Update non-existing entity. Verify HTTP response status code', () => {
        cy.request('GET', '/posts').then((response) => {
            expect(response.status).to.eq(200);
            const posts = response.body;
            const lastPostId = posts[posts.length - 1].id;

            const nonExistingPostId = lastPostId + 1;
            const postDataToUpdate = {
                title: 'Updated Title', body: 'Updated body text'
            };

            cy.request({
                method: 'PUT', url: `/posts/${nonExistingPostId}`, body: postDataToUpdate, failOnStatusCode: false
            }).then((updateResponse) => {
                expect(updateResponse.status).to.eq(404);
            });
        });
    });

    it('Create post entity and update the created entity', () => {
        const newPost = {
            title: "New Post title", body: "Body content of the post."
        };

        cy.request('POST', '/posts', newPost).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            expect(createResponse.body.title).to.eq(newPost.title);
            expect(createResponse.body.body).to.eq(newPost.body);

            const postId = createResponse.body.id;

            const updatedPost = {
                title: "Updated Title", body: "Updated body content of the post."
            };

            cy.request('PUT', `/posts/${postId}`, updatedPost).then((updateResponse) => {
                expect(updateResponse.status).to.eq(200);
                expect(updateResponse.body.title).to.eq(updatedPost.title);
                expect(updateResponse.body.body).to.eq(updatedPost.body);
            });
        });
    });

    it('Delete non-existing post entity', () => {
        cy.request('GET', '/posts').then((response) => {
            expect(response.status).to.eq(200);
            const posts = response.body;
            const lastPostId = posts[posts.length - 1].id;

            const nonExistingPostId = lastPostId + 1;

            cy.request({
                method: 'DELETE', url: `/posts/${nonExistingPostId}`, failOnStatusCode: false
            }).then((deleteResponse) => {
                expect(deleteResponse.status).to.eq(404);
            });
        });
    });

    it('Create post entity, update the created entity, and delete the entity', () => {
        const newPost = {
            title: title, body: postDataF
        };

        cy.request('POST', '/posts', newPost).then((createResponse) => {
            expect(createResponse.status).to.eq(201);
            expect(createResponse.body.title).to.eq(newPost.title);
            expect(createResponse.body.body).to.eq(newPost.body);
            const postId = createResponse.body.id;

            const updatedPost = {
                title: titleU, body: postDataFU
            };

            cy.request('PUT', `/posts/${postId}`, updatedPost).then((updateResponse) => {
                expect(updateResponse.status).to.eq(200);
                expect(updateResponse.body.title).to.eq(updatedPost.title);
                expect(updateResponse.body.body).to.eq(updatedPost.body);

                cy.request('DELETE', `/posts/${postId}`).then((deleteResponse) => {
                    expect(deleteResponse.status).to.eq(200);
                    cy.request({
                        method: 'GET', url: `/posts/${postId}`, failOnStatusCode: false
                    }).then((getResponse) => {
                        expect(getResponse.status).to.eq(404);
                    });
                });
            });
        });
    });
});