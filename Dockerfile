FROM rust
WORKDIR /usr/src/app
COPY . .
RUN yarn install

EXPOSE 3000

CMD ["npm", "start"]