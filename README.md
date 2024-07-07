# pp5ticketing: 온라인 공연 예매 사이트

## 프로젝트 소개

`TypeScript`와 `Nest.js`, `TypeORM`을 사용하여, 온라인 공연 예매 서비스를 만들어봅니다.

## 기능 구현 리스트

- [x] 로그인 / 회원가입
- [x] 프로필 보기
- [x] 새 공연 등록
- [x] 공연 목록 보기
- [x] 공연 검색하기
- [x] 공연 상세보기
- [x] 좌석을 지정하지 않고 공연 예매하기
- [x] 예매 확인하기

## **🏆** 보너스 기능 구현 리스트

- [x] 예매 취소하기
- [ ] 좌석을 지정하여 예매하기
- [ ] 공연의 좌석 예매 정보 확인하기
- [x] 동시성 처리하기
- [x] 테스트 코드 작성하기

## API

![API명세서](./assets/API.PNG)
[API명세서 링크](https://www.notion.so/p5-1725d6610a6f4ce89d61b545c5042dfa?pvs=4)

## ERD

![ERD](./assets/erd.PNG)
[ERD 링크](https://drawsql.app/teams/kangsanlee24/diagrams/p5-ticketing)

## 📬 문의

- 문의는 Issues로 남겨주세요.

---

### commit 규칙

| 작업 타입   | 작업내용                       |
| ----------- | ------------------------------ |
| ✨ update   | 해당 파일에 새로운 기능이 생김 |
| 🎉 add      | 없던 파일을 생성함, 초기 세팅  |
| 🐛 bugfix   | 버그 수정                      |
| ♻️ refactor | 코드 리팩토링                  |
| 🩹 fix      | 코드 수정                      |
| 🚚 move     | 파일 옮김/정리                 |
| 🔥 del      | 기능/파일을 삭제               |
| 🍻 test     | 테스트 코드를 작성             |
| 💄 style    | CSS 스타일 변경                |
| 🙈 gitfix   | .gitignore 수정                |
| 🔨 function | function.js 변경(기능추가 등)  |

```
ex)
🩹 fix/파일명.뭐고침
```

## 생각해보기

### 1. `show_details`테이블에서 **`Virtual Column (= Generated Column)`** 을 사용하지 않고 `reservated_of_seat` 계산한 이유

1. `Virtual Column`의 장점

   - 저장공간 절약. 실제로 DB에 저장은 안함.
   - 데이터가 추가, 변경될 때, 알아서 Update함.

2. `Virtual Column`의 단점

   - 조회할 때마다, 계산이 수행된다. 쿼리 성능이 낮아질 수 있다. => 확실함? 근거, 예시는?
   - 모든 DB가 `Virtual Column`를 지원하는 것은 아니다. 예를 들어 MariaDB, SQL 서버, 오라클, PostgreSQL, SQLite, 파이어버드는 지원한다. 지원 안하는 건???

3. `Virtual Column`을 선택을 안 한 이유와 고려사항

   - 구현하기 쉽다.
   - 다른 DB에서도 구현할 수 있다.

   - 수동으로 업데이트하니까, 쿼리에서 오버헤드가 발생할 수 있고, 트랜잭션으로 일관성 확보해야된다.

[TypeOrm - generatedType: "VIRTUAL"|"STORED"](https://typeorm.io/entities#column-options:~:text=generatedType%3A%20%22VIRTUAL%22%7C%22STORED%22%20%2D%20Generated%20column%20type.%20Used%20only%20in%20MySQL.)

### 2. **`Isolation Level`** 이란?

1. **`READ UNCOMMITTED`**

   - 설명: 가장 낮은 격리 수준이다. 트랜잭션의 변경 내용이 `COMMIT`이나 `ROLLBACK` 여부에 상관 없이 다른 트랜잭션에서 값을 가져올 수 있다.

   - 장점: 읽기 작업이 매우 빠르지만, 가장 일관성이 낮다.

   - 문제점: **`Dirty Read`** 현상이 발생할 수 있다.

     **`Dirty Read`** : 트랜잭션이 작업을 완료하지 않았는 데, 다른 트랜잭션에서 볼 수 있게 되는 현상.

2. **`READ COMMITTED`**

   - 설명: RDB에서 대부분 기본적으로 사용되고 있는 격리 수준이다. 트랜잭션은 `COMMIT`된 데이터만 읽을 수 있고, 다른 트랜잭션이 커밋되기 전에 수행한 변경 사항은 볼 수 없다.

   - 장점: **`Dirty Read`** 를 방지할 수 있다.

   - 문제점: **`Non-repeatable Read`** 현상이 발생할 수 있다. 다른 트랜잭션이 중간에 데이터를 수정하거나 삭제할 수 있기 때문에 같은 쿼리를 두 번 실행했을 때 결과가 다를 수 있다.

3. **`REPEATABLE READ`**

   - 설명: 트랜잭션 동안 같은 데이터를 여러 번 읽어도 항상 동일한 결과를 반환한다. 트랜잭션이 시작된 이후 다른 트랜잭션이 데이터를 수정할 수 없다.

   - 장점: **`Non-repeatable Read`** 를 방지할 수 있다.

   - 문제점: **`Phantom Read`** 현상이 발생할 수 있다. 트랜잭션이 범위를 포함하는 쿼리를 여러 번 실행했을 때 중간에 다른 트랜잭션이 새로운 행을 삽입하면 결과가 달라질 수 있습니다.

4. **`SERIALIZABLE`**

   - 설명: 가장 높은 격리 수준. 트랜잭션을 순차적으로 실행하는 것처럼 동작하여 모든 트랜잭션이 완전히 격리됩니다. 팬텀 리드를 방지한다.

   - 장점: 가장 높은 일관성을 보장한다.

   - 문제점: 성능 저하가 심할 수 있다. 동시성 제어를 위해 락을 많이 사용하므로, 데이터베이스의 처리량이 감소할 수 있다.

5. **`SERIALIZABLE`** 를 선택한 이유

   - 데이터의 **일관성**을 최우선으로 해야하는 예매 시스템이기 때문에.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
